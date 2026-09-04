from pathlib import Path
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from ultralytics import YOLO


# =========================================================
# BioTrack-AI — AI Detection Service
# =========================================================

BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent

MODEL_PATH = (
    PROJECT_DIR
    / "ai-model"
    / "runs"
    / "biotrack_test-4"
    / "weights"
    / "best.pt"
)

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Trained model not found at: {MODEL_PATH}"
    )


# Load YOUR trained model
model = YOLO(str(MODEL_PATH))


# Classes used while training
CLASS_NAMES = {
    0: "glove",
    1: "gauze",
    2: "urine_bag",
    3: "test_tube",
    4: "medical_glasses",
}


# Initial segregation-bin mapping
BIN_MAPPING = {
    "glove": "Red",
    "gauze": "Yellow",
    "urine_bag": "Red",
    "test_tube": "Blue",
    "medical_glasses": "Blue",
}


app = FastAPI(
    title="BioTrack-AI Detection Service",
    description="Biomedical waste object detection using a custom trained YOLO model.",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "success": True,
        "service": "BioTrack-AI Detection Service",
        "model": "Custom YOLO11 trained from scratch",
        "status": "online",
    }


@app.get("/health")
def health():
    return {
        "success": True,
        "status": "healthy",
        "model_loaded": True,
        "model_path": str(MODEL_PATH),
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Receive one image and detect multiple biomedical waste objects.
    """

    if not file.content_type:
        raise HTTPException(
            status_code=400,
            detail="File type could not be determined.",
        )

    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Please upload an image file.",
        )

    try:
        image_bytes = await file.read()

        if not image_bytes:
            raise HTTPException(
                status_code=400,
                detail="Uploaded image is empty.",
            )

        image = Image.open(
            __import__("io").BytesIO(image_bytes)
        ).convert("RGB")

        # Run detection
        results = model.predict(
            source=image,
            conf=0.25,
            imgsz=640,
            device="cpu",
            verbose=False,
        )

        detections = []

        for result in results:

            if result.boxes is None:
                continue

            for box in result.boxes:

                class_id = int(box.cls[0].item())
                confidence = float(box.conf[0].item())

                xyxy = box.xyxy[0].tolist()

                class_name = CLASS_NAMES.get(
                    class_id,
                    f"class_{class_id}",
                )

                bin_name = BIN_MAPPING.get(
                    class_name,
                    "Review Required",
                )

                detections.append(
                    {
                        "item": class_name,
                        "classId": class_id,
                        "confidence": round(confidence, 4),
                        "confidencePercent": round(
                            confidence * 100,
                            2,
                        ),
                        "bin": bin_name,
                        "boundingBox": {
                            "x1": round(xyxy[0], 2),
                            "y1": round(xyxy[1], 2),
                            "x2": round(xyxy[2], 2),
                            "y2": round(xyxy[3], 2),
                        },
                    }
                )

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
        print("Prediction error:", error)

        raise HTTPException(
            status_code=500,
            detail="AI prediction failed.",
        )