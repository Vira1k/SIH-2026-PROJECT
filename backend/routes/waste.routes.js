const express = require("express");

const {
  createWasteRecord,
  getHospitalWasteRecords,
  markWasteCollected,
  deleteWasteRecord,
} = require("../controllers/waste.controller");

const router = express.Router();

// Add waste record
router.post("/", createWasteRecord);

// Get hospital waste records
router.get("/", getHospitalWasteRecords);

// Mark waste as collected
router.patch("/:id/collect", markWasteCollected);

// Delete waste record
router.delete("/:id", deleteWasteRecord);

module.exports = router;