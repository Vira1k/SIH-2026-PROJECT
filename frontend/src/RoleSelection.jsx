import { useState } from "react";
import "./RoleSelection.css";

function RoleSelection({ onBack, onSelectRole }) {

  const [selectedRole, setSelectedRole] = useState("");

  const roles = [
    {
      title: "Hospital Staff",
      description:
        "Manage hospital waste, segregation, pickups and compliance.",
      icon: "🏥",
    },
    {
      title: "Waste Collector",
      description:
        "Manage waste collection, transportation and pickup activities.",
      icon: "🚛",
    },
    {
      title: "Administrator",
      description:
        "Manage users, hospitals, reports and system settings.",
      icon: "⚙️",
    },
  ];

  const continueToNextPage = () => {

    console.log("Continue button clicked");

    if (selectedRole === "") {
      alert("Please select a role.");
      return;
    }

    console.log("Selected:", selectedRole);

    // SEND ROLE TO APP
    onSelectRole(selectedRole);
  };

  return (
    <div className="role-page">

      <div className="role-container">

        {/* HEADER */}
        <header className="role-header">

          <button
            type="button"
            className="back-btn"
            onClick={onBack}
          >
            ← Back
          </button>

          <div className="role-brand">

            <div className="role-brand-icon">
              ♻
            </div>

            <div>
              <h2>BioTrack AI</h2>

              <p>
                Biomedical Waste Management
              </p>
            </div>

          </div>

        </header>

        {/* MAIN CONTENT */}
        <main className="role-content">

          <div className="role-title">

            <span className="step-label">
              STEP 1 OF 2
            </span>

            <h1>
              Choose your role
            </h1>

            <p>
              Select how you will use BioTrack AI
              in your organization.
            </p>

          </div>

          {/* ROLES */}
          <div className="roles-grid">

            {roles.map((role) => (

              <button
                type="button"
                key={role.title}
                className={
                  selectedRole === role.title
                    ? "role-card selected"
                    : "role-card"
                }
                onClick={() => {
                  setSelectedRole(role.title);
                }}
              >

                <div className="role-icon">
                  {role.icon}
                </div>

                <div className="role-info">

                  <h3>
                    {role.title}
                  </h3>

                  <p>
                    {role.description}
                  </p>

                </div>

                <div className="radio">

                  {selectedRole === role.title && (
                    <span>✓</span>
                  )}

                </div>

              </button>

            ))}

          </div>

          {/* CONTINUE */}
          <button
            type="button"
            className="continue-btn"
            onClick={continueToNextPage}
          >
            <span>
              Continue
            </span>

            <span>
              →
            </span>
          </button>

          <p className="role-note">
            You can manage permissions and users
            after registration.
          </p>

        </main>

      </div>

    </div>
  );
}

export default RoleSelection;