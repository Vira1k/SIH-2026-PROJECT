import { useState } from "react";
import "./App.css";

import RoleSelection from "./RoleSelection";
import HospitalRegistration from "./HospitalRegistration";
import HospitalDashboard from "./HospitalDashboard";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
function App() {
  const [page, setPage] = useState(() => {
    const isLoggedIn = localStorage.getItem("biotrackLoggedIn");

    return isLoggedIn === "true" ? "dashboard" : "login";
  });

  const [selectedRole, setSelectedRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // =========================================
  // ROLE SELECTION
  // =========================================

  const handleRoleSelect = (role) => {
    setSelectedRole(role);

    if (role === "Hospital Staff") {
      setPage("hospital-registration");
    } else {
      alert(`${role} registration will be added soon.`);
    }
  };

  // =========================================
  // HOSPITAL REGISTRATION COMPLETE
  // =========================================

  const handleHospitalRegistration = (hospitalData) => {
    // Store ONLY safe hospital information.
    // Password is never stored in localStorage.
    localStorage.setItem(
      "biotrackHospital",
      JSON.stringify(hospitalData)
    );

    // Go back to login
    setEmail(hospitalData?.email || "");
    setPassword("");
    setPage("login");
  };

  // =========================================
  // LOGIN
  // =========================================

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      alert("Please enter your email and password.");
      return;
    }

    try {
      setIsLoggingIn(true);

      // Send login credentials to backend
      const response = await fetch(
       `${API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Invalid email or password.");
        return;
      }

      // Save authentication information
      localStorage.setItem("biotrackLoggedIn", "true");

      // Save JWT token
      if (data.token) {
        localStorage.setItem("biotrackToken", data.token);
      }

      // Save safe hospital information
      if (data.hospital) {
        localStorage.setItem(
          "biotrackHospital",
          JSON.stringify(data.hospital)
        );
      }

      // Clear password from React state
      setPassword("");

      // Open dashboard
      setPage("dashboard");
    } catch (error) {
      console.error("Login error:", error);

      alert(
        "Unable to connect to the BioTrack-AI server. Please make sure the backend is running."
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  // =========================================
  // DASHBOARD
  // =========================================

  if (page === "dashboard") {
    return <HospitalDashboard />;
  }

  // =========================================
  // ROLE PAGE
  // =========================================

  if (page === "roles") {
    return (
      <RoleSelection
        onBack={() => setPage("login")}
        onSelectRole={handleRoleSelect}
      />
    );
  }

  // =========================================
  // HOSPITAL REGISTRATION
  // =========================================

  if (page === "hospital-registration") {
    return (
      <HospitalRegistration
        onBack={() => setPage("roles")}
        onComplete={handleHospitalRegistration}
      />
    );
  }

  // =========================================
  // LOGIN PAGE
  // =========================================

  return (
    <div className="app">

      <div className="login-container">

        {/* =================================
            LEFT SIDE
        ================================= */}

        <div className="login-left">

          <div className="brand-badge">
            ● SMART HOSPITAL PLATFORM
          </div>

          <h1>
            Safer Waste.
            <br />
            Healthier Future.
          </h1>

          <p className="hero-description">
            AI-powered biomedical waste identification,
            smart segregation, collection management,
            and complete waste traceability for modern
            hospitals.
          </p>


          {/* MINI DASHBOARD */}

          <div className="mini-dashboard">

            <div className="mini-dashboard-header">

              <div>
                <span>
                  Hospital Overview
                </span>

                <h3>
                  Today's Activity
                </h3>
              </div>

              <div className="live-status">
                ● LIVE
              </div>

            </div>


            <div className="mini-stats">

              <div className="mini-stat">

                <div className="mini-icon">
                  ♻
                </div>

                <div>
                  <strong>
                    248 kg
                  </strong>

                  <span>
                    Waste Collected
                  </span>
                </div>

              </div>


              <div className="mini-stat">

                <div className="mini-icon">
                  AI
                </div>

                <div>
                  <strong>
                    96.4%
                  </strong>

                  <span>
                    Detection Accuracy
                  </span>
                </div>

              </div>


              <div className="mini-stat">

                <div className="mini-icon">
                  04
                </div>

                <div>
                  <strong>
                    Pickups
                  </strong>

                  <span>
                    Pending Today
                  </span>
                </div>

              </div>

            </div>


            <div className="target-section">

              <div>
                <span>
                  Daily collection target
                </span>

                <strong>
                  78%
                </strong>
              </div>

              <div className="target-bar">

                <div
                  className="target-progress"
                  style={{ width: "78%" }}
                ></div>

              </div>

            </div>

          </div>


          {/* FEATURES */}

          <div className="feature-list">

            <span>
              ✓ AI Detection
            </span>

            <span>
              ✓ Smart Segregation
            </span>

            <span>
              ✓ End-to-End Tracking
            </span>

          </div>

        </div>


        {/* =================================
            RIGHT SIDE
        ================================= */}

        <div className="login-right">

          <div className="login-form-wrapper">


            <div className="login-header">

              <span className="login-small-title">
                WELCOME BACK
              </span>

              <h2>
                Sign in to BioTrack AI
              </h2>

              <p>
                Access your hospital waste management
                dashboard.
              </p>

            </div>


            <form onSubmit={handleLogin}>


              {/* EMAIL */}

              <div className="form-group">

                <label>
                  Hospital Email
                </label>

                <input
                  type="email"
                  placeholder="admin@hospital.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                />

              </div>


              {/* PASSWORD */}

              <div className="form-group">

                <div className="password-label">

                  <label>
                    Password
                  </label>

                  <button
                    type="button"
                    className="forgot-password"
                    onClick={() =>
                      alert(
                        "Password recovery will be connected soon."
                      )
                    }
                  >
                    Forgot password?
                  </button>

                </div>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                />

              </div>


              {/* REMEMBER */}

              <label className="remember-me">

                <input
                  type="checkbox"
                  defaultChecked
                />

                <span>
                  Keep me signed in
                </span>

              </label>


              {/* LOGIN */}

              <button
                type="submit"
                className="login-button"
                disabled={isLoggingIn}
              >

                {isLoggingIn
                  ? "Signing in..."
                  : "Sign in to BioTrack AI"}

                <span>
                  {isLoggingIn ? "..." : "→"}
                </span>

              </button>

            </form>


            {/* CREATE ACCOUNT */}

            <div className="create-account-section">

              <div className="divider">

                <span>
                  NEW TO BIOTRACK?
                </span>

              </div>


              <button
                type="button"
                className="create-account-button"
                onClick={() => setPage("roles")}
              >

                <span>
                  Create Hospital Account
                </span>

                <span>
                  →
                </span>

              </button>

            </div>


            {/* SECURITY */}

            <div className="security-note">

              <div className="security-icon">
                ♡
              </div>

              <div>

                <strong>
                  Secure Hospital Platform
                </strong>

                <span>
                  Your hospital data is protected
                  with secure authentication.
                </span>

              </div>

            </div>


            <div className="login-footer">

              <span>
                © 2026 BioTrack AI
              </span>

              <div>
                <span>Privacy</span>
                <span>Terms</span>
                <span>Support</span>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default App;