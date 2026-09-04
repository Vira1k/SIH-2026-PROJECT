from pathlib import Path
import json

SOURCE_DIR = Path(r"C:\Users\vks37\Downloads\archive\Medical Waste dataset")

ANNOTATIONS_DIR = SOURCE_DIR / "annotations" / "coco"

TARGET_CATEGORIES = {
    1: "test_tube",
    2: "medical_glasses",
    3: "glove",
    4: "glove",
    5: "glove",
    6: "gauze",
    7: "medical_cap",
    8: "shoe_cover",
    9: "glove",
    10: "glove",
    11: "shoe_cover",
    12: "glove",
    13: "urine_bag",
}

print("========================================")
print("BioTrack-AI — Original Dataset Check")
print("========================================")

for split in ["train", "val", "test"]:

    json_file = ANNOTATIONS_DIR / f"{split}.json"

    with open(json_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    image_objects = {}

    for annotation in data.get("annotations", []):

        category_id = annotation["category_id"]

        if category_id not in TARGET_CATEGORIES:
            continue

        image_id = annotation["image_id"]

        image_objects.setdefault(image_id, []).append(
            TARGET_CATEGORIES[category_id]
        )

    multi = [
        (image_id, objects)
        for image_id, objects in image_objects.items()
        if len(objects) >= 2
    ]

    print()
    print(f"{split}:")
    print(f"  Images with selected objects: {len(image_objects)}")
    print(f"  Multi-object images: {len(multi)}")

    for image_id, objects in multi[:5]:
        print(f"    Image ID {image_id}: {objects}")

print()
print("========================================")