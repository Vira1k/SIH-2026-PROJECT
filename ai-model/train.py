from pathlib import Path
from ultralytics import YOLO


# --------------------------------------------------
# BioTrack-AI — Full YOLO training from scratch
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
DATA_YAML = BASE_DIR / "data.yaml"
RUNS_DIR = BASE_DIR / "runs"


print("========================================")
print("       BioTrack-AI FULL AI TRAINING")
print("========================================")
print(f"Dataset: {DATA_YAML}")
print("Training mode: FROM SCRATCH")
print("Pretrained weights: NO")
print("Epochs: 100")
print("Image size: 640")
print("Device: CPU")
print("========================================")


# Create YOLO architecture only.
# No pretrained weights are loaded.
model = YOLO("yolo11n.yaml")


# --------------------------------------------------
# FULL TRAINING
# --------------------------------------------------

results = model.train(
    data=str(DATA_YAML),

    epochs=100,
    imgsz=640,

    batch=4,
    workers=0,

    device="cpu",

    project=str(RUNS_DIR),
    name="biotrack_retrain",

    pretrained=False,

    patience=15,

    verbose=True,
)


print()
print("========================================")
print("       FULL TRAINING COMPLETED")
print("========================================")
print("New model saved inside:")
print(RUNS_DIR / "biotrack_retrain")
print("========================================")