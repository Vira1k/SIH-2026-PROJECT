from pathlib import Path
from ultralytics import YOLO


# --------------------------------------------------
# BioTrack-AI — YOLO training from scratch
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
DATA_YAML = BASE_DIR / "data.yaml"
RUNS_DIR = BASE_DIR / "runs"


print("========================================")
print("       BioTrack-AI AI Training")
print("========================================")
print(f"Dataset: {DATA_YAML}")
print("Training mode: FROM SCRATCH")
print("Pretrained weights: NO")
print("========================================")


# Create YOLO model architecture only.
# No pretrained .pt weights are loaded.
model = YOLO("yolo11n.yaml")


# First short training run.
# We are testing the complete pipeline before
# doing a longer training session.
results = model.train(
    data=str(DATA_YAML),

    epochs=3,
    imgsz=640,

    batch=4,
    workers=0,

    device="cpu",

    project=str(RUNS_DIR),
    name="biotrack_test",

    pretrained=False,

    patience=3,

    verbose=True,
)


print()
print("========================================")
print("       TEST TRAINING COMPLETED")
print("========================================")
print("Model results saved inside:")
print(RUNS_DIR / "biotrack_test")
print("========================================")