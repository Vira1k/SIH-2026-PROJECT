const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema(
  {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
      index: true,
    },

    waste: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Waste",
      required: true,
      index: true,
    },

    collectionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    scheduledDate: {
      type: Date,
      required: true,
    },

    collectorName: {
      type: String,
      required: true,
      trim: true,
    },

    collectorPhone: {
      type: String,
      trim: true,
      default: "",
    },

    vehicleNumber: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "Scheduled",
        "Collected",
        "In Transit",
        "Completed",
        "Cancelled",
      ],
      default: "Scheduled",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    collectedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Collection", collectionSchema);