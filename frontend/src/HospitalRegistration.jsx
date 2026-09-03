import { useState } from "react";
import "./HospitalRegistration.css";

function HospitalRegistration({ onBack, onComplete }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get all form values
    const form = new FormData(e.currentTarget);

    const formData = {
      hospitalName: form.get("hospitalName")?.trim(),
      registrationId: form.get("registrationId")?.trim(),
      facilityType: form.get("facilityType"),

      email: form.get("email")?.trim(),
      contactNumber: form.get("contactNumber")?.trim(),
      address: form.get("address")?.trim(),
      city: form.get("city")?.trim(),
      state: form.get("state"),
      pincode: form.get("pincode")?.trim(),

      adminName: form.get("adminName")?.trim(),
      designation: form.get("designation")?.trim(),

      password: form.get("password"),
      confirmPassword: form.get("confirmPassword"),

      termsAccepted: form.get("terms") === "on",
    };

    // Password match
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    // Password length
    if (formData.password.length < 8) {
      alert("Password must contain at least 8 characters.");
      return;
    }

    // Pincode validation
    if (!/^\d{6}$/.test(formData.pincode)) {
      alert("Please enter a valid 6-digit pincode.");
      return;
    }

    // Terms validation
    if (!formData.termsAccepted) {
      alert("Please accept the Terms of Service and Privacy Policy.");
      return;
    }

    try {
      setIsLoading(true);

      // Send registration data to backend
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hospitalName: formData.hospitalName,
            registrationNumber: formData.registrationId,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            adminName: formData.adminName,
            email: formData.email,
            phone: formData.contactNumber,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      // Backend error
      if (!response.ok) {
        alert(data.message || "Hospital registration failed.");
        return;
      }

      // Registration successful
      alert("Hospital account created successfully!");

      // Send only safe hospital information to App.jsx
      if (onComplete) {
        onComplete(data.hospital);
      }
    } catch (error) {
      console.error("Registration error:", error);

      alert(
        "Unable to connect to the BioTrack-AI server. Please make sure the backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="registration-page">
      {/* Background */}
      <div className="registration-bg bg-one"></div>
      <div className="registration-bg bg-two"></div>

      <div className="registration-container">

        {/* ================= HEADER ================= */}

        <header className="registration-header">

          <button
            className="registration-back"
            onClick={onBack}
            type="button"
          >
            ← Back
          </button>

          <div className="registration-brand">

            <div className="registration-logo">
              +
            </div>

            <div>
              <h1>BioTrack AI</h1>
              <p>Biomedical Waste Management</p>
            </div>

          </div>

          <div className="registration-step">

            <div className="step active">
              <span>✓</span>
            </div>

            <div className="step-line active-line"></div>

            <div className="step active">
              <span>02</span>
            </div>

          </div>

        </header>


        {/* ================= MAIN ================= */}

        <main className="registration-main">

          {/* TITLE */}

          <div className="registration-title">

            <div className="title-badge">
              🏥 HOSPITAL REGISTRATION
            </div>

            <h2>
              Set up your hospital
            </h2>

            <p>
              Enter your hospital details to create your
              BioTrack AI management account.
            </p>

          </div>


          {/* ================= FORM CARD ================= */}

          <div className="registration-card">

            <div className="card-heading">

              <div className="card-heading-icon">
                🏥
              </div>

              <div>
                <h3>Hospital Information</h3>

                <p>
                  Provide accurate information about your facility.
                </p>
              </div>

            </div>


            <form onSubmit={handleSubmit}>

              {/* ================= BASIC INFORMATION ================= */}

              <div className="form-section-title">
                <span>01</span>
                Basic Information
              </div>


              <div className="form-grid">

                {/* Hospital Name */}

                <div className="registration-field full-width">

                  <label>
                    Hospital / Healthcare Facility Name
                    <span>*</span>
                  </label>

                  <div className="registration-input">

                    <span>🏥</span>

                    <input
                      type="text"
                      name="hospitalName"
                      placeholder="Enter hospital name"
                      required
                    />

                  </div>

                </div>


                {/* Registration ID */}

                <div className="registration-field">

                  <label>
                    Hospital Registration ID
                    <span>*</span>
                  </label>

                  <div className="registration-input">

                    <span>▣</span>

                    <input
                      type="text"
                      name="registrationId"
                      placeholder="e.g. HOSP-2026-001"
                      required
                    />

                  </div>

                </div>


                {/* Facility Type */}

                <div className="registration-field">

                  <label>
                    Facility Type
                    <span>*</span>
                  </label>

                  <div className="registration-input select-input">

                    <span>▤</span>

                    <select
                      name="facilityType"
                      required
                      defaultValue=""
                    >

                      <option value="" disabled>
                        Select facility type
                      </option>

                      <option value="hospital">
                        Hospital
                      </option>

                      <option value="clinic">
                        Clinic
                      </option>

                      <option value="laboratory">
                        Laboratory
                      </option>

                      <option value="nursing-home">
                        Nursing Home
                      </option>

                      <option value="other">
                        Other Healthcare Facility
                      </option>

                    </select>

                  </div>

                </div>

              </div>


              {/* ================= CONTACT ================= */}

              <div className="form-section-title">

                <span>02</span>

                Contact Information

              </div>


              <div className="form-grid">

                {/* Email */}

                <div className="registration-field">

                  <label>
                    Hospital Email
                    <span>*</span>
                  </label>

                  <div className="registration-input">

                    <span>✉</span>

                    <input
                      type="email"
                      name="email"
                      placeholder="admin@hospital.com"
                      required
                    />

                  </div>

                </div>


                {/* Phone */}

                <div className="registration-field">

                  <label>
                    Contact Number
                    <span>*</span>
                  </label>

                  <div className="registration-input">

                    <span>☎</span>

                    <input
                      type="tel"
                      name="contactNumber"
                      placeholder="+91 XXXXX XXXXX"
                      required
                    />

                  </div>

                </div>


                {/* Address */}

                <div className="registration-field full-width">

                  <label>
                    Hospital Address
                    <span>*</span>
                  </label>

                  <div className="registration-input">

                    <span>⌖</span>

                    <input
                      type="text"
                      name="address"
                      placeholder="Enter complete hospital address"
                      required
                    />

                  </div>

                </div>


                {/* City */}

                <div className="registration-field">

                  <label>
                    City
                    <span>*</span>
                  </label>

                  <div className="registration-input">

                    <span>⌂</span>

                    <input
                      type="text"
                      name="city"
                      placeholder="Enter city"
                      required
                    />

                  </div>

                </div>


                {/* State */}

                <div className="registration-field">

                  <label>
                    State
                    <span>*</span>
                  </label>

                  <div className="registration-input select-input">

                    <span>⌖</span>

                    <select
                      name="state"
                      required
                      defaultValue=""
                    >

                      <option value="" disabled>
                        Select state
                      </option>

                      <option>Andhra Pradesh</option>
                      <option>Assam</option>
                      <option>Bihar</option>
                      <option>Chhattisgarh</option>
                      <option>Delhi</option>
                      <option>Gujarat</option>
                      <option>Haryana</option>
                      <option>Himachal Pradesh</option>
                      <option>Jharkhand</option>
                      <option>Karnataka</option>
                      <option>Kerala</option>
                      <option>Madhya Pradesh</option>
                      <option>Maharashtra</option>
                      <option>Odisha</option>
                      <option>Punjab</option>
                      <option>Rajasthan</option>
                      <option>Tamil Nadu</option>
                      <option>Telangana</option>
                      <option>Uttar Pradesh</option>
                      <option>Uttarakhand</option>
                      <option>West Bengal</option>

                    </select>

                  </div>

                </div>


                {/* Pincode */}

                <div className="registration-field">

                  <label>
                    Pincode
                    <span>*</span>
                  </label>

                  <div className="registration-input">

                    <span>⌑</span>

                    <input
                      type="text"
                      name="pincode"
                      placeholder="Enter 6-digit pincode"
                      maxLength="6"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      required
                    />

                  </div>

                </div>

              </div>


              {/* ================= ADMIN ================= */}

              <div className="form-section-title">

                <span>03</span>

                Account Administrator

              </div>


              <div className="form-grid">

                {/* Admin Name */}

                <div className="registration-field">

                  <label>
                    Administrator Name
                    <span>*</span>
                  </label>

                  <div className="registration-input">

                    <span>♙</span>

                    <input
                      type="text"
                      name="adminName"
                      placeholder="Enter full name"
                      required
                    />

                  </div>

                </div>


                {/* Designation */}

                <div className="registration-field">

                  <label>
                    Designation
                    <span>*</span>
                  </label>

                  <div className="registration-input">

                    <span>◉</span>

                    <input
                      type="text"
                      name="designation"
                      placeholder="e.g. Hospital Administrator"
                      required
                    />

                  </div>

                </div>


                {/* Password */}

                <div className="registration-field">

                  <label>
                    Create Password
                    <span>*</span>
                  </label>

                  <div className="registration-input">

                    <span>🔒</span>

                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Create a strong password"
                      minLength="8"
                      required
                    />

                    <button
                      type="button"
                      className="registration-password-toggle"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                    >
                      {showPassword ? "◉" : "○"}
                    </button>

                  </div>

                </div>


                {/* Confirm Password */}

                <div className="registration-field">

                  <label>
                    Confirm Password
                    <span>*</span>
                  </label>

                  <div className="registration-input">

                    <span>🔐</span>

                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      name="confirmPassword"
                      placeholder="Confirm password"
                      minLength="8"
                      required
                    />

                    <button
                      type="button"
                      className="registration-password-toggle"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                    >
                      {showConfirmPassword ? "◉" : "○"}
                    </button>

                  </div>

                </div>

              </div>


              {/* ================= TERMS ================= */}

              <label className="terms-row">

                <input
                  type="checkbox"
                  name="terms"
                  required
                />

                <span>
                  I agree to the BioTrack AI{" "}
                  <b>Terms of Service</b> and{" "}
                  <b>Privacy Policy</b>.
                </span>

              </label>


              {/* ================= BUTTONS ================= */}

              <div className="registration-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={onBack}
                  disabled={isLoading}
                >
                  Back
                </button>


                <button
                  type="submit"
                  className="create-hospital-button"
                  disabled={isLoading}
                >

                  <span>
                    {isLoading
                      ? "Creating Account..."
                      : "Create Hospital Account"}
                  </span>

                  <span>
                    {isLoading ? "..." : "→"}
                  </span>

                </button>

              </div>

            </form>

          </div>


          {/* SECURITY */}

          <div className="registration-security">

            <span>🛡️</span>

            <div>

              <strong>
                Secure & Confidential
              </strong>

              <p>
                Hospital information is protected using
                secure authentication and role-based access.
              </p>

            </div>

          </div>

        </main>


        {/* FOOTER */}

        <footer className="registration-footer">

          <span>
            © 2026 BioTrack AI
          </span>

          <div>
            <span>Privacy</span>
            <span>Terms</span>
            <span>Support</span>
          </div>

        </footer>

      </div>

    </div>
  );
}

export default HospitalRegistration;