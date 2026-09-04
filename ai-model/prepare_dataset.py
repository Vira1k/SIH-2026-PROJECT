import json
import shutil
from pathlib import Path

# ============================================================
# BioTrack-AI
# Prepare selected medical-waste classes from the Kaggle
# Medical Waste 4.0 COCO dataset and convert them to YOLO.
#
# IMPORTANT:
# - Original Kaggle dataset will NOT be modified.
# - Unwanted classes will be ignored.
# - Six glove variants will become one "glove" class.
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent

# Downloaded/extracted Kaggle dataset
SOURCE_ROOT = Path(
    r"C:\Users\vks37\Downloads\archive\Medical Waste dataset"
)

# Clean BioTrack YOLO dataset
OUTPUT_ROOT = PROJECT_ROOT / "dataset"

# Our first 5 classes
CLASS_NAMES = [
    "glove",
    "gauze",
    "urine_bag",
    "test_tube",
    "medical_glasses",
]

CLASS_TO_ID = {
    name: index
    for index, name in enumerate(CLASS_NAMES)
}

# All glove variants become one class: glove
GLOVE_SOURCE_NAMES = {
    "glove pair surgery",
    "glove single nitrile",
    "glove single surgery",
    "glove single latex",
    "glove pair nitrile",
    "glove pair latex",
}

# Source class -> BioTrack class
SOURCE_TO_TARGET = {
    "gauze": "gauze",
    "urine bag": "urine_bag",
    "test tube": "test_tube",
    "medical glasses": "medical_glasses",
}

for glove_name in GLOVE_SOURCE_NAMES:
    SOURCE_TO_TARGET[glove_name] = "glove"


def find_images():
    """Find all image files in the original dataset."""

    image_index = {}

    for path in SOURCE_ROOT.rglob("*"):
        if (
            path.is_file()
            and path.suffix.lower()
            in {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
        ):
            image_index.setdefault(path.name, path)

    return image_index


def convert_bbox(bbox, width, height):
    """
    COCO format:
        [x_min, y_min, width, height]

    YOLO format:
        [x_center, y_center, width, height]

    YOLO values are normalized between 0 and 1.
    """

    x, y, w, h = map(float, bbox)

    # Keep box inside image boundaries
    x = max(0.0, min(x, width))
    y = max(0.0, min(y, height))

    w = max(0.0, min(w, width - x))
    h = max(0.0, min(h, height - y))

    if w <= 0 or h <= 0:
        return None

    x_center = x + (w / 2)
    y_center = y + (h / 2)

    return (
        x_center / width,
        y_center / height,
        w / width,
        h / height,
    )


def prepare_split(split, image_index):
    """Convert one COCO split to YOLO."""

    json_path = (
        SOURCE_ROOT
        / "annotations"
        / "coco"
        / f"{split}.json"
    )

    if not json_path.exists():
        print(f"[ERROR] Missing: {json_path}")
        return 0

    data = json.loads(
        json_path.read_text(encoding="utf-8")
    )

    # COCO category ID -> category name
    categories = {
        category["id"]: category["name"]
        for category in data.get("categories", [])
    }

    # Only our selected categories
    selected_category_ids = {
        category_id
        for category_id, category_name in categories.items()
        if category_name in SOURCE_TO_TARGET
    }

    # image_id -> annotations
    annotations_by_image = {}

    for annotation in data.get("annotations", []):

        category_id = annotation.get("category_id")

        if category_id not in selected_category_ids:
            continue

        annotations_by_image.setdefault(
            annotation["image_id"],
            []
        ).append(annotation)

    # Output folders
    output_images = (
        OUTPUT_ROOT
        / "images"
        / split
    )

    output_labels = (
        OUTPUT_ROOT
        / "labels"
        / split
    )

    output_images.mkdir(
        parents=True,
        exist_ok=True
    )

    output_labels.mkdir(
        parents=True,
        exist_ok=True
    )

    count = 0

    # Process every image
    for image in data.get("images", []):

        image_id = image["id"]

        image_annotations = (
            annotations_by_image.get(
                image_id,
                []
            )
        )

        # Ignore images containing none of our classes
        if not image_annotations:
            continue

        filename = Path(
            image["file_name"]
        ).name

        source_image = image_index.get(
            filename
        )

        if source_image is None:
            print(
                f"[WARNING] Image not found: {filename}"
            )
            continue

        width = float(image["width"])
        height = float(image["height"])

        label_lines = []

        for annotation in image_annotations:

            source_name = categories[
                annotation["category_id"]
            ]

            target_name = SOURCE_TO_TARGET[
                source_name
            ]

            class_id = CLASS_TO_ID[
                target_name
            ]

            converted = convert_bbox(
                annotation["bbox"],
                width,
                height,
            )

            if converted is None:
                continue

            x_center, y_center, box_width, box_height = (
                converted
            )

            label_lines.append(
                f"{class_id} "
                f"{x_center:.6f} "
                f"{y_center:.6f} "
                f"{box_width:.6f} "
                f"{box_height:.6f}"
            )

        if not label_lines:
            continue

        # Copy image
        shutil.copy2(
            source_image,
            output_images / filename
        )

        # Create YOLO label
        label_file = (
            output_labels
            / f"{Path(filename).stem}.txt"
        )

        label_file.write_text(
            "\n".join(label_lines) + "\n",
            encoding="utf-8"
        )

        count += 1

    print(
        f"{split}: "
        f"{count} images + "
        f"{count} label files"
    )

    return count


def create_data_yaml():

    yaml_content = """path: .

train: images/train
val: images/val
test: images/test

names:
  0: glove
  1: gauze
  2: urine_bag
  3: test_tube
  4: medical_glasses
"""

    yaml_path = (
        OUTPUT_ROOT
        / "data.yaml"
    )

    yaml_path.write_text(
        yaml_content,
        encoding="utf-8"
    )


def main():

    print("=" * 60)
    print("BioTrack-AI Dataset Preparation")
    print("=" * 60)

    print(
        f"Source dataset:\n{SOURCE_ROOT}\n"
    )

    print(
        f"Output dataset:\n{OUTPUT_ROOT}\n"
    )

    # Check original dataset
    if not SOURCE_ROOT.exists():

        print(
            "[ERROR] Kaggle dataset not found."
        )

        print(
            "Expected location:"
        )

        print(SOURCE_ROOT)

        return

    print("Target classes:")

    for class_id, class_name in enumerate(
        CLASS_NAMES
    ):
        print(
            f"  {class_id}: {class_name}"
        )

    print()

    print("Indexing images...")

    image_index = find_images()

    print(
        f"Found {len(image_index)} unique images."
    )

    print()

    total_images = 0

    # Convert train / val / test
    for split in [
        "train",
        "val",
        "test"
    ]:

        count = prepare_split(
            split,
            image_index
        )

        total_images += count

    # Create YOLO data.yaml
    create_data_yaml()

    print()
    print("=" * 60)
    print("DATASET PREPARATION COMPLETE")
    print("=" * 60)

    print(
        f"Total selected images: {total_images}"
    )

    print(
        f"Dataset location:\n{OUTPUT_ROOT}"
    )

    print()
    print(
        "Original Kaggle dataset was NOT modified."
    )

    print()
    print(
        "Next step: inspect the generated dataset "
        "before training."
    )


if __name__ == "__main__":
    main()