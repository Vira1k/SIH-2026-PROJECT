const mongoose = require("mongoose");

const wasteRecordSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },

    wasteId: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    weight: {
      type: Number,
      required: true,
      min: 0,
    },

    bin: {
      type: String,
      required: true,
      enum: ["Yellow", "Red", "White", "Blue"],
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Collected"],
      default: "Pending",
    },

    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("WasteRecord", wasteRecordSchema);