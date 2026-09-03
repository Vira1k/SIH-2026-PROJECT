const Waste = require("../models/Waste");

// =========================================
// GET ALL WASTE RECORDS
// =========================================

const getWasteRecords = async (req, res) => {
  try {
    const records = await Waste.find({
      hospital: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    console.error("Get waste records error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching waste records.",
    });
  }
};

// =========================================
// CREATE WASTE RECORD
// =========================================

const createWasteRecord = async (req, res) => {
  try {
    const {
      type,
      category,
      bin,
      weight,
      department,
      aiConfidence,
      aiDetected,
    } = req.body;

    // Check required fields
    if (
      !type ||
      !category ||
      !bin ||
      weight === undefined ||
      !department
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required waste fields.",
      });
    }

    // Validate weight
    const numericWeight = Number(weight);

    if (
      Number.isNaN(numericWeight) ||
      numericWeight <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Weight must be a valid number greater than 0.",
      });
    }

    // Generate Waste ID
    const lastWaste = await Waste.findOne({})
      .sort({ createdAt: -1 })
      .select("wasteId");

    let nextNumber = 1001;

    if (lastWaste?.wasteId) {
      const numberPart = Number(
        lastWaste.wasteId.replace("BW-", "")
      );

      if (!Number.isNaN(numberPart)) {
        nextNumber = numberPart + 1;
      }
    }

    const wasteId = `BW-${nextNumber}`;

    // Create waste record
    const waste = await Waste.create({
      hospital: req.user.id,
      wasteId,
      type: type.trim(),
      category: category.trim(),
      bin,
      weight: numericWeight,
      department: department.trim(),
      status: "Pending",
      aiConfidence:
        aiConfidence !== undefined
          ? Number(aiConfidence)
          : null,
      aiDetected: aiDetected === true,
    });

    res.status(201).json({
      success: true,
      message: "Waste record created successfully.",
      record: waste,
    });
  } catch (error) {
    console.error("Create waste record error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating waste record.",
    });
  }
};

// =========================================
// UPDATE WASTE STATUS
// =========================================

const updateWasteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Collected",
      "Processing",
      "Disposed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid waste status.",
      });
    }

    const waste = await Waste.findOneAndUpdate(
      {
        _id: id,
        hospital: req.user.id,
      },
      {
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!waste) {
      return res.status(404).json({
        success: false,
        message: "Waste record not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Waste status updated successfully.",
      record: waste,
    });
  } catch (error) {
    console.error("Update waste status error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating waste status.",
    });
  }
};

// =========================================
// DELETE WASTE RECORD
// =========================================

const deleteWasteRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const waste = await Waste.findOneAndDelete({
      _id: id,
      hospital: req.user.id,
    });

    if (!waste) {
      return res.status(404).json({
        success: false,
        message: "Waste record not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Waste record deleted successfully.",
    });
  } catch (error) {
    console.error("Delete waste record error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while deleting waste record.",
    });
  }
};

module.exports = {
  getWasteRecords,
  createWasteRecord,
  updateWasteStatus,
  deleteWasteRecord,
};