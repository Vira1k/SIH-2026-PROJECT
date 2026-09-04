from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

LABEL_DIR = BASE_DIR / "dataset" / "labels" / "test"
IMAGE_DIR = BASE_DIR / "dataset" / "images" / "test"

found = []

for label_file in LABEL_DIR.glob("*.txt"):
    lines = [
        line.strip()
        for line in label_file.read_text().splitlines()
        if line.strip()
    ]

    if len(lines) >= 2:
        for extension in [".jpg", ".jpeg", ".png"]:
            image_file = IMAGE_DIR / (label_file.stem + extension)

            if image_file.exists():
                found.append((image_file, len(lines)))
                break

print("========================================")
print("BioTrack-AI — Multi-Object Images")
print("========================================")

print(f"\nFound {len(found)} multi-object images.\n")

for image_file, count in found[:10]:
    print(f"{image_file.name} -> {count} objects")