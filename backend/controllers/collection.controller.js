const Collection = require("../models/Collection");
const Waste = require("../models/Waste");

// =========================================
// GET ALL COLLECTIONS
// =========================================

const getCollections = async (req, res) => {
  try {
    const collections = await Collection.find({
      hospital: req.user.id,
    })
      .populate("waste")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: collections.length,
      collections,
    });
  } catch (error) {
    console.error("Get collections error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching collections.",
    });
  }
};

// =========================================
// CREATE COLLECTION
// =========================================

const createCollection = async (req, res) => {
  try {
    const {
      wasteId,
      scheduledDate,
      collectorName,
      collectorPhone,
      vehicleNumber,
      notes,
    } = req.body;

    if (
      !wasteId ||
      !scheduledDate ||
      !collectorName
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Waste ID, scheduled date and collector name are required.",
      });
    }

    // Find waste belonging to logged-in hospital
    const waste = await Waste.findOne({
      _id: wasteId,
      hospital: req.user.id,
    });

    if (!waste) {
      return res.status(404).json({
        success: false,
        message: "Waste record not found.",
      });
    }

    // Prevent duplicate active collection
    const existingCollection = await Collection.findOne({
      waste: waste._id,
      hospital: req.user.id,
      status: {
        $nin: ["Completed", "Cancelled"],
      },
    });

    if (existingCollection) {
      return res.status(409).json({
        success: false,
        message:
          "A collection is already scheduled for this waste record.",
      });
    }

    // Generate collection ID
    const lastCollection = await Collection.findOne({})
      .sort({ createdAt: -1 })
      .select("collectionId");

    let nextNumber = 1001;

    if (lastCollection?.collectionId) {
      const numberPart = Number(
        lastCollection.collectionId.replace("COL-", "")
      );

      if (!Number.isNaN(numberPart)) {
        nextNumber = numberPart + 1;
      }
    }

    const collectionId = `COL-${nextNumber}`;

    const collection = await Collection.create({
      hospital: req.user.id,
      waste: waste._id,
      collectionId,
      scheduledDate: new Date(scheduledDate),
      collectorName: collectorName.trim(),
      collectorPhone: collectorPhone?.trim() || "",
      vehicleNumber: vehicleNumber?.trim() || "",
      status: "Scheduled",
      notes: notes?.trim() || "",
    });

    // Update waste status
    await Waste.findOneAndUpdate(
      {
        _id: waste._id,
        hospital: req.user.id,
      },
      {
        status: "Processing",
      }
    );

    const populatedCollection = await Collection.findById(
      collection._id
    ).populate("waste");

    res.status(201).json({
      success: true,
      message: "Waste collection scheduled successfully.",
      collection: populatedCollection,
    });
  } catch (error) {
    console.error("Create collection error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating collection.",
    });
  }
};

// =========================================
// UPDATE COLLECTION STATUS
// =========================================

const updateCollectionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "Scheduled",
      "Collected",
      "In Transit",
      "Completed",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid collection status.",
      });
    }

    const collection = await Collection.findOne({
      _id: id,
      hospital: req.user.id,
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: "Collection record not found.",
      });
    }

    collection.status = status;

    if (status === "Collected") {
      collection.collectedAt = new Date();
    }

    if (status === "Completed") {
      collection.completedAt = new Date();
    }

    await collection.save();

    // Keep waste lifecycle synchronized
    let wasteStatus = null;

    if (status === "Scheduled") {
      wasteStatus = "Processing";
    } else if (status === "Collected") {
      wasteStatus = "Collected";
    } else if (status === "Completed") {
      wasteStatus = "Disposed";
    }

    if (wasteStatus) {
      await Waste.findOneAndUpdate(
        {
          _id: collection.waste,
          hospital: req.user.id,
        },
        {
          status: wasteStatus,
        }
      );
    }

    const updatedCollection = await Collection.findById(
      collection._id
    ).populate("waste");

    res.status(200).json({
      success: true,
      message: "Collection status updated successfully.",
      collection: updatedCollection,
    });
  } catch (error) {
    console.error("Update collection status error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating collection.",
    });
  }
};

// =========================================
// DELETE COLLECTION
// =========================================

const deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;

    const collection = await Collection.findOneAndDelete({
      _id: id,
      hospital: req.user.id,
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: "Collection record not found.",
      });
    }

    // Return waste to Pending if collection was cancelled/deleted
    await Waste.findOneAndUpdate(
      {
        _id: collection.waste,
        hospital: req.user.id,
      },
      {
        status: "Pending",
      }
    );

    res.status(200).json({
      success: true,
      message: "Collection record deleted successfully.",
    });
  } catch (error) {
    console.error("Delete collection error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while deleting collection.",
    });
  }
};

module.exports = {
  getCollections,
  createCollection,
  updateCollectionStatus,
  deleteCollection,
};