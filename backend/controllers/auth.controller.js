const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Hospital = require("../models/Hospital");

// =========================================
// REGISTER HOSPITAL
// =========================================

const registerHospital = async (req, res) => {
  try {
    const {
      hospitalName,
      registrationNumber,
      address,
      city,
      state,
      pincode,
      adminName,
      email,
      phone,
      password,
    } = req.body;

    // Check required fields
    if (
      !hospitalName ||
      !registrationNumber ||
      !address ||
      !city ||
      !state ||
      !pincode ||
      !adminName ||
      !email ||
      !phone ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    // Check existing email
    const existingEmail = await Hospital.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "A hospital account with this email already exists.",
      });
    }

    // Check existing registration number
    const existingRegistrationNumber = await Hospital.findOne({
      registrationNumber: registrationNumber.trim(),
    });

    if (existingRegistrationNumber) {
      return res.status(409).json({
        success: false,
        message: "This hospital registration number already exists.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create hospital
    const hospital = await Hospital.create({
      hospitalName: hospitalName.trim(),
      registrationNumber: registrationNumber.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      adminName: adminName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: hashedPassword,
      role: "Hospital Staff",
    });

    // Return safe hospital data
    res.status(201).json({
      success: true,
      message: "Hospital account created successfully.",
      hospital: {
        id: hospital._id,
        hospitalName: hospital.hospitalName,
        registrationNumber: hospital.registrationNumber,
        address: hospital.address,
        city: hospital.city,
        state: hospital.state,
        pincode: hospital.pincode,
        adminName: hospital.adminName,
        email: hospital.email,
        phone: hospital.phone,
        role: hospital.role,
      },
    });
  } catch (error) {
    console.error("Hospital registration error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating hospital account.",
    });
  }
};


// =========================================
// LOGIN HOSPITAL
// =========================================

const loginHospital = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check credentials are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password.",
      });
    }

    // Find hospital by email
    const hospital = await Hospital.findOne({
      email: email.toLowerCase().trim(),
    });

    // Do not reveal whether email exists
    if (!hospital) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Compare entered password with hashed password
    const isPasswordValid = await bcrypt.compare(
      password,
      hospital.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: hospital._id,
        email: hospital.email,
        role: hospital.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // Return safe hospital information
    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      hospital: {
        id: hospital._id,
        hospitalName: hospital.hospitalName,
        registrationNumber: hospital.registrationNumber,
        address: hospital.address,
        city: hospital.city,
        state: hospital.state,
        pincode: hospital.pincode,
        adminName: hospital.adminName,
        email: hospital.email,
        phone: hospital.phone,
        role: hospital.role,
      },
    });
  } catch (error) {
    console.error("Hospital login error:", error);

    res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
};


module.exports = {
  registerHospital,
  loginHospital,
};