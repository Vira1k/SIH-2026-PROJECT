const Hospital = require("../models/Hospital");

// Remove password before sending hospital data to frontend
const sanitizeHospital = (hospital) => ({
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

  notifications: hospital.notifications,
  aiAlerts: hospital.aiAlerts,
  pickupAlerts: hospital.pickupAlerts,

  createdAt: hospital.createdAt,
  updatedAt: hospital.updatedAt,
});

// ==============================
// GET CURRENT HOSPITAL PROFILE
// GET /api/auth/me
// ==============================

const getMyHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.user.id).select(
      "-password"
    );

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital account not found.",
      });
    }

    return res.status(200).json({
      success: true,
      hospital: sanitizeHospital(hospital),
    });
  } catch (error) {
    console.error("Get hospital profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load hospital profile.",
    });
  }
};

// ==============================
// UPDATE CURRENT HOSPITAL PROFILE
// PATCH /api/auth/me
// ==============================

const updateMyHospital = async (req, res) => {
  try {
    const {
      hospitalName,
      adminName,
      email,
      notifications,
      aiAlerts,
      pickupAlerts,
    } = req.body;

    // Validate required editable fields
    if (
      !hospitalName ||
      !hospitalName.trim() ||
      !adminName ||
      !adminName.trim() ||
      !email ||
      !email.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Hospital name, administrator name and email are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check whether another hospital is already using this email
    const emailOwner = await Hospital.findOne({
      email: normalizedEmail,
      _id: { $ne: req.user.id },
    });

    if (emailOwner) {
      return res.status(409).json({
        success: false,
        message:
          "Email is already registered to another hospital account.",
      });
    }

    // Find current hospital
    const hospital = await Hospital.findById(req.user.id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital account not found.",
      });
    }

    // Update profile information
    hospital.hospitalName = hospitalName.trim();
    hospital.adminName = adminName.trim();
    hospital.email = normalizedEmail;

    // Update notification preferences
    if (typeof notifications === "boolean") {
      hospital.notifications = notifications;
    }

    if (typeof aiAlerts === "boolean") {
      hospital.aiAlerts = aiAlerts;
    }

    if (typeof pickupAlerts === "boolean") {
      hospital.pickupAlerts = pickupAlerts;
    }

    await hospital.save();

    return res.status(200).json({
      success: true,
      message: "Hospital settings updated successfully.",
      hospital: sanitizeHospital(hospital),
    });
  } catch (error) {
    console.error("Update hospital profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update hospital settings.",
    });
  }
};

module.exports = {
  getMyHospital,
  updateMyHospital,
};