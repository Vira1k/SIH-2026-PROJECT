const mongoose = require("mongoose");

const wasteSchema = new mongoose.Schema(
  {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
      index: true,
    },

    wasteId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    type: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    bin: {
      type: String,
      required: true,
      enum: ["Yellow", "Red", "White", "Blue"],
    },

    weight: {
      type: Number,
      required: true,
      min: 0.1,
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Collected", "Processing", "Disposed"],
      default: "Pending",
    },

    aiConfidence: {
      type: Number,
      default: null,
    },

    aiDetected: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Waste", wasteSchema);