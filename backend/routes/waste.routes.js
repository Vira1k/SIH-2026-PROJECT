const express = require("express");

const protect = require("../middleware/auth.middleware");

const {
  getWasteRecords,
  createWasteRecord,
  updateWasteStatus,
  deleteWasteRecord,
} = require("../controllers/waste.controller");

const router = express.Router();

// All waste routes require authentication
router.use(protect);

// Get all waste records for logged-in hospital
router.get("/", getWasteRecords);

// Create new waste record
router.post("/", createWasteRecord);

// Update waste status
router.patch("/:id/status", updateWasteStatus);

// Delete waste record
router.delete("/:id", deleteWasteRecord);

module.exports = router;