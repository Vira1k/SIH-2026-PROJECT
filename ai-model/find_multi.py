from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

print("========================================")
print(" BioTrack-AI — Finding Multi-Object Images")
print("========================================")

total_found = 0

for split in ["train", "val", "test"]:

    LABEL_DIR = BASE_DIR / "dataset" / "labels" / split
    IMAGE_DIR = BASE_DIR / "dataset" / "images" / split

    found = []

    for label_file in LABEL_DIR.glob("*.txt"):

        lines = [
            line.strip()
            for line in label_file.read_text().splitlines()
            if line.strip()
        ]

        if len(lines) >= 2:

            image_file = None

            for extension in [".jpg", ".jpeg", ".png"]:

                candidate = IMAGE_DIR / (label_file.stem + extension)

                if candidate.exists():
                    image_file = candidate
                    break

            if image_file:
                found.append((image_file, len(lines)))

    print()
    print(f"{split.upper()}: {len(found)} multi-object images")

    for image_file, object_count in found[:5]:
        print(f"  {image_file.name} -> {object_count} objects")

    total_found += len(found)

print()
print("========================================")
print(f"TOTAL MULTI-OBJECT IMAGES: {total_found}")
print("========================================")