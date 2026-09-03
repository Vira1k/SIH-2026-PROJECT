const express = require("express");

const {
  registerHospital,
  loginHospital,
} = require("../controllers/auth.controller");

const {
  getMyHospital,
  updateMyHospital,
} = require("../controllers/hospital.controller");

const protect = require("../middleware/auth.middleware");

const router = express.Router();

// ==============================
// AUTH ROUTES
// ==============================

router.post("/register", registerHospital);

router.post("/login", loginHospital);

// ==============================
// HOSPITAL PROFILE / SETTINGS
// ==============================

// Get logged-in hospital
router.get("/me", protect, getMyHospital);

// Update logged-in hospital
router.patch("/me", protect, updateMyHospital);

module.exports = router;