from pathlib import Path
from io import BytesIO

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from ultralytics import YOLO


# ============================================================
# BioTrack-AI AI SERVICE
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent

MODEL_PATH = (
    PROJECT_DIR
    / "ai-model"
    / "runs"
    / "biotrack_retrain"
    / "weights"
    / "best.pt"
)


# ============================================================
# LOAD MODEL
# ============================================================

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Trained model not found at: {MODEL_PATH}"
    )

print("========================================")
print("       BioTrack-AI AI SERVICE")
print("========================================")
print(f"Loading model from: {MODEL_PATH}")

model = YOLO(str(MODEL_PATH))

print("Model loaded successfully.")
print("========================================")


# ============================================================
# MODEL CLASSES
# ============================================================

CLASS_NAMES = {
    0: "glove",
    1: "gauze",
    2: "urine_bag",
    3: "test_tube",
    4: "medical_glasses",
}


# ============================================================
# BIOMEDICAL WASTE BIN MAPPING
# ============================================================

BIN_MAPPING = {
    "glove": "Red",
    "gauze": "Yellow",
    "urine_bag": "Red",
    "test_tube": "Blue",
    "medical_glasses": "Blue",
}


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="BioTrack-AI AI Service",
    description="AI-powered biomedical waste detection service",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://biotrack-ai-frontend.vercel.app",
        "https://sih-2026-project.netlify.app",
        "http://localhost:5173",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "success": True,
        "message": "BioTrack-AI AI Service is running successfully",
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():
    return {
        "success": True,
        "status": "healthy",
        "model_loaded": model is not None,
        "model_path": str(MODEL_PATH),
    }


# ============================================================
# AI PREDICTION
# ============================================================

@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    # --------------------------------------------------------
    # Validate file type
    # --------------------------------------------------------

    if not file.content_type:
        raise HTTPException(
            status_code=400,
            detail="File content type is missing.",
        )

    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a valid image file.",
        )

    try:

        # ----------------------------------------------------
        # Read uploaded image
        # ----------------------------------------------------

        image_bytes = await file.read()

        if not image_bytes:
            raise HTTPException(
                status_code=400,
                detail="Uploaded image is empty.",
            )

        # ----------------------------------------------------
        # Open image safely
        # ----------------------------------------------------

        image = Image.open(
            BytesIO(image_bytes)
        ).convert("RGB")

        # ----------------------------------------------------
        # YOLO inference
        #
        # 416 image size is intentionally used to reduce
        # memory usage on Render's 512 MB instance.
        # ----------------------------------------------------

        results = model.predict(
            source=image,
            conf=0.25,
            imgsz=416,
            device="cpu",
            verbose=False,
            max_det=10,
        )

        # ----------------------------------------------------
        # Process detections
        # ----------------------------------------------------

        detections = []

        for result in results:

            if result.boxes is None:
                continue

            for box in result.boxes:

                class_id = int(
                    box.cls[0].item()
                )

                confidence = float(
                    box.conf[0].item()
                )

                xyxy = box.xyxy[0].tolist()

                class_name = CLASS_NAMES.get(
                    class_id,
                    f"class_{class_id}"
                )

                bin_name = BIN_MAPPING.get(
                    class_name,
                    "Review Required"
                )

                detections.append(
                    {
                        "item": class_name,
                        "classId": class_id,
                        "confidence": confidence,
                        "confidencePercent": round(
                            confidence * 100,
                            2
                        ),
                        "bin": bin_name,
                        "boundingBox": {
                            "x1": round(
                                float(xyxy[0]),
                                2
                            ),
                            "y1": round(
                                float(xyxy[1]),
                                2
                            ),
                            "x2": round(
                                float(xyxy[2]),
                                2
                            ),
                            "y2": round(
                                float(xyxy[3]),
                                2
                            ),
                        },
                    }
                )

        # ----------------------------------------------------
        # Return successful prediction
        # ----------------------------------------------------

        return {
            "success": True,
            "filename": file.filename,
            "imageWidth": image.width,
            "imageHeight": image.height,
            "count": len(detections),
            "detections": detections,
        }

    except HTTPException:
        raise

    except Exception as error:

        print("========================================")
        print("Prediction error:")
        print(str(error))
        print("========================================")

        raise HTTPException(
            status_code=500,
            detail="AI prediction failed.",
        )