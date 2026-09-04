from pathlib import Path
from ultralytics import YOLO


# --------------------------------------------------
# BioTrack-AI — Test trained AI model
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = (
    BASE_DIR
    / "runs"
    / "biotrack_test-4"
    / "weights"
    / "best.pt"
)

SOURCE_DIR = BASE_DIR / "dataset" / "images" / "test"
OUTPUT_DIR = BASE_DIR / "runs" / "prediction_test"


print("========================================")
print("       BioTrack-AI AI Prediction")
print("========================================")
print(f"Model: {MODEL_PATH}")
print(f"Test images: {SOURCE_DIR}")
print("========================================")


# Load our trained model
model = YOLO(str(MODEL_PATH))


# Run detection
results = model.predict(
    source=str(SOURCE_DIR),
    imgsz=640,
    conf=0.25,
    device="cpu",
    save=True,
    project=str(OUTPUT_DIR),
    name="results",
)


print()
print("========================================")
print("       PREDICTION COMPLETED")
print("========================================")
print(f"Results saved inside:")
print(OUTPUT_DIR / "results")
print("========================================")