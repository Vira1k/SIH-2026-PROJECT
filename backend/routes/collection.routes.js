const express = require("express");

const protect = require("../middleware/auth.middleware");

const {
  getCollections,
  createCollection,
  updateCollectionStatus,
  deleteCollection,
} = require("../controllers/collection.controller");

const router = express.Router();

// All collection APIs require authentication
router.use(protect);

// Get all collections
router.get("/", getCollections);

// Schedule a new collection
router.post("/", createCollection);

// Update collection status
router.patch("/:id/status", updateCollectionStatus);

// Delete collection
router.delete("/:id", deleteCollection);

module.exports = router;