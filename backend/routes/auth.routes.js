const express = require("express");

const {
  registerHospital,
  loginHospital,
} = require("../controllers/auth.controller");

const router = express.Router();


// =========================================
// HOSPITAL REGISTRATION
// =========================================

router.post("/register", registerHospital);


// =========================================
// HOSPITAL LOGIN
// =========================================

router.post("/login", loginHospital);


module.exports = router;