const mongoose = require("mongoose");
const WasteRecord = require("../models/WasteRecord");

// =========================================
// ADD WASTE RECORD
// =========================================

const createWasteRecord = async (req, res) => {
  try {
    const {
      hospitalId,
      wasteId,
      category,
      weight,
      bin,
      department,
      status,
      recordedAt,
    } = req.body;

    // Check required fields
    if (
      !hospitalId ||
      !wasteId ||
      !category ||
      weight === undefined ||
      !bin ||
      !department
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required waste fields.",
      });
    }

    // Validate hospital ID
    if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hospital ID.",
      });
    }

    // Validate weight
    if (Number(weight) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Waste weight must be greater than 0.",
      });
    }

    // Create record
    const wasteRecord = await WasteRecord.create({
      hospitalId,
      wasteId: wasteId.trim(),
      category: category.trim(),
      weight: Number(weight),
      bin,
      department: department.trim(),
      status: status || "Pending",
      recordedAt: recordedAt || new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Waste record created successfully.",
      wasteRecord,
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
// GET HOSPITAL WASTE RECORDS
// =========================================

const getHospitalWasteRecords = async (req, res) => {
  try {
    const { hospitalId } = req.query;

    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: "Hospital ID is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hospital ID.",
      });
    }

    const wasteRecords = await WasteRecord.find({
      hospitalId,
    }).sort({
      recordedAt: -1,
    });

    res.status(200).json({
      success: true,
      count: wasteRecords.length,
      wasteRecords,
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
// MARK WASTE AS COLLECTED
// =========================================

const markWasteCollected = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid waste record ID.",
      });
    }

    const wasteRecord = await WasteRecord.findByIdAndUpdate(
      id,
      {
        status: "Collected",
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!wasteRecord) {
      return res.status(404).json({
        success: false,
        message: "Waste record not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Waste marked as collected.",
      wasteRecord,
    });
  } catch (error) {
    console.error("Mark waste collected error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating waste record.",
    });
  }
};

// =========================================
// DELETE WASTE RECORD
// =========================================

const deleteWasteRecord = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid waste record ID.",
      });
    }

    const wasteRecord = await WasteRecord.findByIdAndDelete(id);

    if (!wasteRecord) {
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
  createWasteRecord,
  getHospitalWasteRecords,
  markWasteCollected,
  deleteWasteRecord,
};