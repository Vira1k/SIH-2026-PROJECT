import { useState } from "react";
import "./HospitalDashboard.css";
import AIDetection from "./AIDetection";
import WasteManagement from "./WasteManagement";
import CollectionSectionAPI from "./CollectionSection";
import TrackingSectionAPI from "./TrackingSection";
import AnalyticsSectionAPI from "./AnalyticsSection";
import AlertsSectionAPI from "./AlertsSection";

function HospitalDashboard() {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);

  const handleMenuChange = (menu) => {
    setActiveMenu(menu);
    setIsSidebarOpen(false);
    setIsAccountOpen(false);
  };

  // Get hospital information saved during registration
  const savedHospital = localStorage.getItem("biotrackHospital");

  let hospitalData = {};

  try {
    hospitalData = savedHospital ? JSON.parse(savedHospital) : {};
  } catch {
    hospitalData = {};
  }

  const hospitalName =
    hospitalData.hospitalName ||
    hospitalData.name ||
    "City Hospital";

  const adminName =
    hospitalData.contactPerson ||
    hospitalData.adminName ||
    "Hospital Admin";

  const hospitalEmail =
    hospitalData.email ||
    "admin@hospital.com";

  const menuItems = [
    { name: "Dashboard", icon: "⌂" },
    { name: "AI Detect", icon: "✦" },
    { name: "Waste", icon: "♻" },
    { name: "Collection", icon: "▣" },
    { name: "Tracking", icon: "⌖" },
    { name: "Analytics", icon: "▥" },
    { name: "Alerts", icon: "!" },
  ];

        const handleLogout = () => {
        localStorage.removeItem("biotrackLoggedIn");
        localStorage.removeItem("biotrackToken");
        localStorage.removeItem("biotrackHospital");
        window.location.reload();
        };

  const handleAccountAction = (action) => {
    setIsAccountOpen(false);

    if (action === "profile") {
      setActiveMenu("Profile");
      setIsSidebarOpen(false);
      return;
    }

    if (action === "settings") {
      setActiveMenu("Settings");
      setIsSidebarOpen(false);
      return;
    }

    if (action === "logout") {
      handleLogout();
    }
  };

  const renderContent = () => {
    switch (activeMenu) {
      case "AI Detect":
        return <AIDetection />;

      case "Waste":
        return <WasteManagement />;

      case "Collection":
        return <CollectionSectionAPI />;

      case "Tracking":
        return <TrackingSectionAPI />;

      case "Analytics":
        return <AnalyticsSectionAPI />;

      case "Alerts":
        return <AlertsSectionAPI />;

      case "Profile":
        return (
          <ProfileSection
            hospitalName={hospitalName}
            adminName={adminName}
            hospitalEmail={hospitalEmail}
          />
        );

      case "Settings":
        return (
          <SettingsSection
            hospitalName={hospitalName}
            adminName={adminName}
            hospitalEmail={hospitalEmail}
          />
        );

      case "Dashboard":
      default:
        return (
          <DashboardOverview
            setActiveMenu={setActiveMenu}
            hospitalName={hospitalName}
          />
        );
    }
  };

  return (
    <div className={`dashboard-page ${isNightMode ? "night-mode" : ""}`}>

      {/* =========================
          SIDEBAR
      ========================== */}

      <button
        type="button"
        className={`mobile-menu-btn ${isSidebarOpen ? "open" : ""}`}
        onClick={() => setIsSidebarOpen((prev) => !prev)}
        aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
        aria-expanded={isSidebarOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {isSidebarOpen && (
        <button
          type="button"
          className="mobile-menu-overlay"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close menu"
        />
      )}

      <div className="mobile-quick-actions">
        <button
          type="button"
          className="mobile-profile-btn"
          onClick={() => setIsAccountOpen((prev) => !prev)}
          aria-label="Open profile menu"
          aria-expanded={isAccountOpen}
        >
          <span className="mobile-profile-avatar">
            {adminName.charAt(0).toUpperCase()}
          </span>
        </button>

        <button
          type="button"
          className="mobile-notification-btn"
          onClick={() => {
            setActiveMenu("Alerts");
            setIsAccountOpen(false);
          }}
          aria-label="View alerts"
          title="Alerts"
        >
          <span>🔔</span>
          <span className="mobile-notification-dot">3</span>
        </button>

        <button
          type="button"
          className="mobile-night-btn"
          onClick={() => setIsNightMode((prev) => !prev)}
          aria-label={isNightMode ? "Turn off night mode" : "Turn on night mode"}
          title={isNightMode ? "Light mode" : "Night mode"}
        >
          <span>{isNightMode ? "☀" : "☾"}</span>
        </button>

        {isAccountOpen && (
          <div className="mobile-account-menu" role="menu">
            <div className="account-menu-user">
              <div className="account-menu-avatar">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div>
                <strong>{adminName}</strong>
                <span>{hospitalEmail}</span>
              </div>
            </div>

            <div className="account-menu-divider" />

            <button
              type="button"
              className="account-menu-item"
              onClick={() => handleAccountAction("profile")}
              role="menuitem"
            >
              <span>◉</span>
              <span>Profile</span>
            </button>

            <button
              type="button"
              className="account-menu-item"
              onClick={() => handleAccountAction("settings")}
              role="menuitem"
            >
              <span>⚙</span>
              <span>Settings</span>
            </button>

            <button
              type="button"
              className="account-menu-item danger"
              onClick={() => handleAccountAction("logout")}
              role="menuitem"
            >
              <span>↪</span>
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      <aside className={`dashboard-sidebar ${isSidebarOpen ? "sidebar-open" : ""}`}>

        <div className="dashboard-logo">
          <div className="dashboard-logo-icon">+</div>

          <div>
            <h2>BioTrack AI</h2>
            <span>Hospital Platform</span>
          </div>
        </div>

        {/* Hospital information */}
        <div className="hospital-mini-card">
          <div className="hospital-avatar">
            {hospitalName.charAt(0).toUpperCase()}
          </div>

          <div>
            <strong>{hospitalName}</strong>
            <span>Hospital Staff</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="dashboard-nav">

          <p className="nav-heading">MAIN MENU</p>

          {menuItems.map((item) => (
            <button
              key={item.name}
              type="button"
              className={
                activeMenu === item.name
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() => handleMenuChange(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>

              <span>{item.name}</span>

              {item.name === "Alerts" && (
                <span className="alert-count">3</span>
              )}
            </button>
          ))}

          <p className="nav-heading settings-heading">
            SYSTEM
          </p>

          <button
            type="button"
            className={
              activeMenu === "Settings"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => handleMenuChange("Settings")}
          >
            <span className="nav-icon">⚙</span>
            <span>Settings</span>
          </button>

        </nav>

        {/* Sidebar bottom */}
        <div className="sidebar-bottom">

          <button
            type="button"
            className="support-card"
            onClick={() =>
              alert(
                "BioTrack AI Support\n\nEmail: support@biotrack.ai\nPhone: +91 1800-123-456"
              )
            }
          >
            <div className="support-icon">?</div>

            <div>
              <strong>Need help?</strong>
              <span>Contact support</span>
            </div>
          </button>

          <button
            type="button"
            className="logout-btn"
            onClick={handleLogout}
          >
            <span>↪</span>
            Sign out
          </button>

        </div>

      </aside>

      {/* =========================
          MAIN CONTENT
      ========================== */}

      <main className="dashboard-main">

        {/* HEADER */}

        <header className="dashboard-header">

          <div>
            <p className="breadcrumb">
              Hospital / {activeMenu}
            </p>

            <h1>
              {activeMenu === "Dashboard"
                ? `Good morning, ${adminName}`
                : activeMenu}
            </h1>

            <p className="header-subtitle">
              {activeMenu === "Dashboard"
                ? "Here's what's happening with your biomedical waste today."
                : `Manage your hospital's ${activeMenu.toLowerCase()} operations.`}
            </p>
          </div>

          <div className="header-actions">

            <button
              type="button"
              className="notification-btn"
              onClick={() => setActiveMenu("Alerts")}
              title="View alerts"
            >
              🔔
              <span></span>
            </button>

            <div className="user-account-wrapper">
              <button
                type="button"
                className={`user-profile ${isAccountOpen ? "account-open" : ""}`}
                onClick={() => setIsAccountOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={isAccountOpen}
              >
              <div className="user-avatar">
                {adminName.charAt(0).toUpperCase()}
              </div>

              <div className="user-details">
                <strong>{adminName}</strong>
                <span>{hospitalEmail}</span>
              </div>

                <span className="profile-arrow">▾</span>
              </button>

              {isAccountOpen && (
                <>
                  <button
                    type="button"
                    className="account-menu-backdrop"
                    onClick={() => setIsAccountOpen(false)}
                    aria-label="Close account menu"
                  />

                  <div className="account-menu" role="menu">
                    <div className="account-menu-user">
                      <div className="account-menu-avatar">
                        {adminName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <strong>{adminName}</strong>
                        <span>{hospitalEmail}</span>
                      </div>
                    </div>

                    <div className="account-menu-divider" />

                    <button
                      type="button"
                      className="account-menu-item"
                      onClick={() => handleAccountAction("profile")}
                      role="menuitem"
                    >
                      <span>◉</span>
                      <span>Profile</span>
                    </button>

                    <button
                      type="button"
                      className="account-menu-item"
                      onClick={() => handleAccountAction("settings")}
                      role="menuitem"
                    >
                      <span>⚙</span>
                      <span>Settings</span>
                    </button>

                    <button
                      type="button"
                      className="account-menu-item danger"
                      onClick={() => handleAccountAction("logout")}
                      role="menuitem"
                    >
                      <span>↪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>

        </header>

        {/* ACTIVE PAGE */}

        <div className="page-content">
          {renderContent()}
        </div>

      </main>

    </div>
  );
}


/* =========================================================
   DASHBOARD OVERVIEW
========================================================= */

function DashboardOverview({ setActiveMenu, hospitalName }) {
  return (
    <>
      {/* STAT CARDS */}

      <section className="overview-grid">

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon waste-stat">♻</div>
            <span className="trend positive">↑ 12.4%</span>
          </div>

          <p>Waste Collected</p>

          <h2>
            248.6 <span>kg</span>
          </h2>

          <small>Compared to yesterday</small>
        </div>


        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon ai-stat">AI</div>
            <span className="trend positive">↑ 2.1%</span>
          </div>

          <p>AI Detection Accuracy</p>

          <h2>
            96.4<span>%</span>
          </h2>

          <small>Based on today's scans</small>
        </div>


        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon pickup-stat">▣</div>
            <span className="trend neutral">Today</span>
          </div>

          <p>Pending Pickups</p>

          <h2>04</h2>

          <small>2 require immediate attention</small>
        </div>


        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon compliance-stat">✓</div>
            <span className="trend positive">Excellent</span>
          </div>

          <p>Compliance Score</p>

          <h2>
            94.2<span>%</span>
          </h2>

          <small>Biomedical waste compliance</small>
        </div>

      </section>


      {/* MAIN DASHBOARD GRID */}

      <section className="dashboard-grid">

        {/* AI DETECTION CARD */}

        <div className="panel ai-panel">

          <div className="panel-header">

            <div>
              <span className="panel-label">
                AI POWERED
              </span>

              <h2>Waste Detection</h2>

              <p>
                Identify biomedical waste category using AI.
              </p>
            </div>

            <div className="ai-live">
              <span></span>
              AI READY
            </div>

          </div>


          <div className="detection-area">

            <div className="upload-box">

              <div className="upload-icon">
                ↑
              </div>

              <h3>Scan Waste</h3>

              <p>
                Upload an image of waste for AI classification.
              </p>

              <button
                type="button"
                className="upload-btn"
                onClick={() => setActiveMenu("AI Detect")}
              >
                Open AI Detection
              </button>

              <span>
                JPG, PNG up to 10MB
              </span>

            </div>


            <div className="detection-info">

              <div className="detection-placeholder">

                <div className="scan-circle">
                  ✦
                </div>

                <strong>
                  AI Classification
                </strong>

                <p>
                  Open AI Detection to analyze biomedical waste.
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* COLLECTION */}

        <div className="panel collection-panel">

          <div className="panel-header">

            <div>
              <span className="panel-label">
                COLLECTION
              </span>

              <h2>Today's Schedule</h2>
            </div>

            <button
              type="button"
              className="view-all-btn"
              onClick={() => setActiveMenu("Collection")}
            >
              View all
            </button>

          </div>


          <div className="schedule-list">

            <ScheduleItem
              time="09:30"
              period="AM"
              title="General Biomedical Waste"
              location="Ward A"
              weight="42 kg"
              status="Completed"
              statusClass="completed"
            />

            <ScheduleItem
              time="12:00"
              period="PM"
              title="Sharps Waste"
              location="Operation Theatre"
              weight="18 kg"
              status="Pending"
              statusClass="pending"
            />

            <ScheduleItem
              time="03:30"
              period="PM"
              title="Laboratory Waste"
              location="Laboratory"
              weight="26 kg"
              status="Upcoming"
              statusClass="upcoming"
            />

            <ScheduleItem
              time="06:00"
              period="PM"
              title="Infectious Waste"
              location="ICU"
              weight="31 kg"
              status="Upcoming"
              statusClass="upcoming"
            />

          </div>

        </div>

      </section>


      {/* BOTTOM GRID */}

      <section className="bottom-grid">

        {/* WASTE SEGREGATION */}

        <div className="panel breakdown-panel">

          <div className="panel-header">

            <div>
              <span className="panel-label">
                WASTE MANAGEMENT
              </span>

              <h2>Waste Segregation</h2>
            </div>

            <button
              type="button"
              className="view-all-btn"
              onClick={() => setActiveMenu("Waste")}
            >
              Details →
            </button>

          </div>


          <div className="waste-bars">

            <WasteBar
              name="Yellow Category"
              className="yellow"
              fillClass="yellow-fill"
              width="72%"
              weight="82 kg"
            />

            <WasteBar
              name="Red Category"
              className="red"
              fillClass="red-fill"
              width="54%"
              weight="61 kg"
            />

            <WasteBar
              name="White Category"
              className="white"
              fillClass="white-fill"
              width="43%"
              weight="48 kg"
            />

            <WasteBar
              name="Blue Category"
              className="blue"
              fillClass="blue-fill"
              width="51%"
              weight="57 kg"
            />

          </div>

        </div>


        {/* ALERTS */}

        <div className="panel alerts-panel">

          <div className="panel-header">

            <div>
              <span className="panel-label">
                ATTENTION
              </span>

              <h2>Recent Alerts</h2>
            </div>

            <button
              type="button"
              className="alert-badge alert-badge-button"
              onClick={() => setActiveMenu("Alerts")}
            >
              3 New
            </button>

          </div>


          <div className="alert-list">

            <AlertItem
              type="warning"
              icon="!"
              title="Pickup overdue"
              description="Sharps waste from OT-02 requires collection."
              time="12 minutes ago"
            />

            <AlertItem
              type="info"
              icon="i"
              title="AI review recommended"
              description="2 waste classifications need manual review."
              time="34 minutes ago"
            />

            <AlertItem
              type="success"
              icon="✓"
              title="Compliance target reached"
              description="Today's segregation target is above 90%."
              time="1 hour ago"
            />

          </div>

        </div>

      </section>


      {/* HOSPITAL INFO */}

      <div className="dashboard-info-strip">
        <span>🏥</span>

        <div>
          <strong>{hospitalName}</strong>
          <p>BioTrack AI Hospital Waste Management System</p>
        </div>

        <span className="system-online">
          ● System Online
        </span>
      </div>

    </>
  );
}


/* =========================================================
   WASTE SECTION
========================================================= */

function WasteSection() {

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [wasteRecords, setWasteRecords] = useState([
    {
      id: "BW-1001",
      type: "Used Gloves",
      category: "Yellow",
      department: "Ward A",
      weight: "12 kg",
      status: "Collected",
    },
    {
      id: "BW-1002",
      type: "Syringes",
      category: "White",
      department: "OT-02",
      weight: "7 kg",
      status: "Pending",
    },
    {
      id: "BW-1003",
      type: "Plastic Tubes",
      category: "Red",
      department: "ICU",
      weight: "15 kg",
      status: "Collected",
    },
    {
      id: "BW-1004",
      type: "Medicine Vials",
      category: "Blue",
      department: "Pharmacy",
      weight: "9 kg",
      status: "Pending",
    },
    {
      id: "BW-1005",
      type: "Dressing Material",
      category: "Yellow",
      department: "Ward B",
      weight: "21 kg",
      status: "Collected",
    },
  ]);

  const addDemoRecord = () => {
    const newRecord = {
      id: `BW-${1006 + wasteRecords.length}`,
      type: "New Biomedical Waste",
      category: "Yellow",
      department: "Ward A",
      weight: "5 kg",
      status: "Pending",
    };

    setWasteRecords((prev) => [newRecord, ...prev]);

    alert("New waste record added successfully.");
  };

  const filteredRecords = wasteRecords.filter((item) => {

    const matchesSearch =
      item.type.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.department.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "All" ||
      item.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="module-page">

      <div className="module-header">

        <div>
          <span className="panel-label">
            WASTE MANAGEMENT
          </span>

          <h2>Biomedical Waste Records</h2>

          <p>
            Record, classify and monitor hospital biomedical waste.
          </p>
        </div>

        <button
          type="button"
          className="primary-action"
          onClick={addDemoRecord}
        >
          + Add Waste Record
        </button>

      </div>


      {/* SUMMARY */}

      <div className="module-summary">

        <div className="mini-stat">
          <span>♻</span>
          <div>
            <small>Total Waste</small>
            <strong>248.6 kg</strong>
          </div>
        </div>

        <div className="mini-stat">
          <span>🟡</span>
          <div>
            <small>Yellow</small>
            <strong>82 kg</strong>
          </div>
        </div>

        <div className="mini-stat">
          <span>🔴</span>
          <div>
            <small>Red</small>
            <strong>61 kg</strong>
          </div>
        </div>

        <div className="mini-stat">
          <span>⚪</span>
          <div>
            <small>White</small>
            <strong>48 kg</strong>
          </div>
        </div>

      </div>


      {/* FILTER */}

      <div className="filter-panel">

        <input
          type="text"
          placeholder="Search waste, ID or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="Yellow">Yellow</option>
          <option value="Red">Red</option>
          <option value="White">White</option>
          <option value="Blue">Blue</option>
        </select>

      </div>


      {/* TABLE */}

      <div className="table-panel">

        <div className="table-title">
          <h3>Waste Records</h3>
          <span>{filteredRecords.length} records</span>
        </div>

        <div className="table-wrapper">

          <table>

            <thead>
              <tr>
                <th>Waste ID</th>
                <th>Waste Type</th>
                <th>Category</th>
                <th>Department</th>
                <th>Weight</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {filteredRecords.map((item) => (
                <tr key={item.id}>

                  <td>
                    <strong>{item.id}</strong>
                  </td>

                  <td>{item.type}</td>

                  <td>
                    <span
                      className={`category-pill ${item.category.toLowerCase()}`}
                    >
                      {item.category}
                    </span>
                  </td>

                  <td>{item.department}</td>

                  <td>{item.weight}</td>

                  <td>
                    <span
                      className={
                        item.status === "Collected"
                          ? "table-status collected"
                          : "table-status pending"
                      }
                    >
                      {item.status}
                    </span>
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   COLLECTION SECTION
========================================================= */

function CollectionSection() {

  const [pickups, setPickups] = useState([
    {
      id: "PK-2041",
      department: "Ward A",
      waste: "General Biomedical Waste",
      weight: "42 kg",
      time: "09:30 AM",
      status: "Completed",
    },
    {
      id: "PK-2042",
      department: "Operation Theatre",
      waste: "Sharps Waste",
      weight: "18 kg",
      time: "12:00 PM",
      status: "Pending",
    },
    {
      id: "PK-2043",
      department: "Laboratory",
      waste: "Laboratory Waste",
      weight: "26 kg",
      time: "03:30 PM",
      status: "Upcoming",
    },
    {
      id: "PK-2044",
      department: "ICU",
      waste: "Infectious Waste",
      weight: "31 kg",
      time: "06:00 PM",
      status: "Upcoming",
    },
  ]);

  const requestPickup = () => {

    const newPickup = {
      id: `PK-${2050 + pickups.length}`,
      department: "Ward B",
      waste: "Biomedical Waste",
      weight: "10 kg",
      time: "Next Available",
      status: "Pending",
    };

    setPickups((prev) => [...prev, newPickup]);

    alert("Pickup request created successfully.");
  };

  const updateStatus = (id) => {

    setPickups((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status:
                item.status === "Pending"
                  ? "Completed"
                  : item.status,
            }
          : item
      )
    );
  };

  return (
    <div className="module-page">

      <div className="module-header">

        <div>
          <span className="panel-label">
            COLLECTION MANAGEMENT
          </span>

          <h2>Waste Collection</h2>

          <p>
            Manage pickup requests and collection schedules.
          </p>
        </div>

        <button
          type="button"
          className="primary-action"
          onClick={requestPickup}
        >
          + Request Pickup
        </button>

      </div>


      <div className="module-summary">

        <div className="mini-stat">
          <span>▣</span>
          <div>
            <small>Total Pickups</small>
            <strong>{pickups.length}</strong>
          </div>
        </div>

        <div className="mini-stat">
          <span>✓</span>
          <div>
            <small>Completed</small>
            <strong>
              {pickups.filter(
                (p) => p.status === "Completed"
              ).length}
            </strong>
          </div>
        </div>

        <div className="mini-stat">
          <span>⏳</span>
          <div>
            <small>Pending</small>
            <strong>
              {pickups.filter(
                (p) => p.status === "Pending"
              ).length}
            </strong>
          </div>
        </div>

        <div className="mini-stat">
          <span>⚖</span>
          <div>
            <small>Today's Waste</small>
            <strong>117 kg</strong>
          </div>
        </div>

      </div>


      <div className="collection-cards">

        {pickups.map((pickup) => (

          <div className="collection-card" key={pickup.id}>

            <div className="collection-card-top">

              <span className="pickup-id">
                {pickup.id}
              </span>

              <span
                className={`table-status ${
                  pickup.status === "Completed"
                    ? "collected"
                    : pickup.status === "Pending"
                    ? "pending"
                    : "upcoming"
                }`}
              >
                {pickup.status}
              </span>

            </div>

            <h3>{pickup.waste}</h3>

            <p>📍 {pickup.department}</p>

            <div className="collection-details">

              <span>🕒 {pickup.time}</span>

              <span>⚖ {pickup.weight}</span>

            </div>

            {pickup.status === "Pending" && (
              <button
                type="button"
                className="small-action"
                onClick={() => updateStatus(pickup.id)}
              >
                Mark Completed
              </button>
            )}

          </div>

        ))}

      </div>

    </div>
  );
}


/* =========================================================
   TRACKING SECTION
========================================================= */

function TrackingSection() {

  const [trackingId, setTrackingId] = useState("");
  const [tracked, setTracked] = useState(false);

  const handleTrack = () => {

    if (!trackingId.trim()) {
      alert("Please enter a Waste ID or Pickup ID.");
      return;
    }

    setTracked(true);
  };

  return (
    <div className="module-page">

      <div className="module-header">

        <div>
          <span className="panel-label">
            TRACEABILITY
          </span>

          <h2>Waste Tracking</h2>

          <p>
            Track biomedical waste from generation to final disposal.
          </p>
        </div>

      </div>


      <div className="tracking-search">

        <div>
          <h3>Track Waste</h3>
          <p>
            Enter a Waste ID or Pickup ID to view its journey.
          </p>
        </div>

        <div className="track-form">

          <input
            type="text"
            placeholder="Example: BW-1001"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
          />

          <button
            type="button"
            className="primary-action"
            onClick={handleTrack}
          >
            Track
          </button>

        </div>

      </div>


      {tracked && (

        <div className="tracking-result">

          <div className="tracking-result-header">

            <div>
              <span className="panel-label">
                TRACKING RESULT
              </span>

              <h3>{trackingId.toUpperCase()}</h3>
            </div>

            <span className="table-status collected">
              Active
            </span>

          </div>


          <div className="tracking-timeline">

            <TimelineItem
              active
              title="Waste Generated"
              description="Waste recorded by hospital staff."
              time="08:30 AM"
            />

            <TimelineItem
              active
              title="AI Classification"
              description="Waste category verified by BioTrack AI."
              time="08:34 AM"
            />

            <TimelineItem
              active
              title="Segregation"
              description="Waste placed into recommended category bin."
              time="08:38 AM"
            />

            <TimelineItem
              active
              title="Pickup Scheduled"
              description="Collection request created."
              time="09:00 AM"
            />

            <TimelineItem
              title="Treatment / Disposal"
              description="Awaiting final processing."
              time="Pending"
            />

          </div>

        </div>

      )}

    </div>
  );
}


/* =========================================================
   ANALYTICS SECTION
========================================================= */

function AnalyticsSection() {

  const analytics = [
    {
      name: "Yellow",
      value: 82,
      percentage: 72,
      className: "yellow-fill",
    },
    {
      name: "Red",
      value: 61,
      percentage: 54,
      className: "red-fill",
    },
    {
      name: "White",
      value: 48,
      percentage: 43,
      className: "white-fill",
    },
    {
      name: "Blue",
      value: 57,
      percentage: 51,
      className: "blue-fill",
    },
  ];

  return (
    <div className="module-page">

      <div className="module-header">

        <div>
          <span className="panel-label">
            INSIGHTS
          </span>

          <h2>Waste Analytics</h2>

          <p>
            Monitor waste generation, segregation and compliance performance.
          </p>
        </div>

        <button
          type="button"
          className="secondary-action"
          onClick={() => alert("Analytics report generated successfully.")}
        >
          ↓ Generate Report
        </button>

      </div>


      <div className="analytics-cards">

        <div className="analytics-card">
          <span>♻</span>
          <small>Total Waste</small>
          <strong>248.6 kg</strong>
          <em>↑ 12.4% from yesterday</em>
        </div>

        <div className="analytics-card">
          <span>✓</span>
          <small>Compliance</small>
          <strong>94.2%</strong>
          <em>Excellent performance</em>
        </div>

        <div className="analytics-card">
          <span>✦</span>
          <small>AI Accuracy</small>
          <strong>96.4%</strong>
          <em>Based on today's scans</em>
        </div>

        <div className="analytics-card">
          <span>▣</span>
          <small>Collections</small>
          <strong>28</strong>
          <em>Successful this week</em>
        </div>

      </div>


      <div className="analytics-grid">

        <div className="panel">

          <div className="panel-header">
            <div>
              <span className="panel-label">
                CATEGORY ANALYSIS
              </span>

              <h2>Waste by Category</h2>
            </div>
          </div>

          <div className="analytics-bars">

            {analytics.map((item) => (
              <div className="analytics-bar-row" key={item.name}>

                <div className="analytics-bar-label">
                  <strong>{item.name}</strong>
                  <span>{item.value} kg</span>
                </div>

                <div className="analytics-bar">
                  <div
                    className={`analytics-bar-fill ${item.className}`}
                    style={{
                      width: `${item.percentage}%`,
                    }}
                  ></div>
                </div>

              </div>
            ))}

          </div>

        </div>


        <div className="panel">

          <div className="panel-header">
            <div>
              <span className="panel-label">
                WEEKLY PERFORMANCE
              </span>

              <h2>Collection Trend</h2>
            </div>
          </div>

          <div className="weekly-chart">

            <div className="chart-column">
              <span style={{ height: "45%" }}></span>
              <small>Mon</small>
            </div>

            <div className="chart-column">
              <span style={{ height: "65%" }}></span>
              <small>Tue</small>
            </div>

            <div className="chart-column">
              <span style={{ height: "52%" }}></span>
              <small>Wed</small>
            </div>

            <div className="chart-column">
              <span style={{ height: "80%" }}></span>
              <small>Thu</small>
            </div>

            <div className="chart-column">
              <span style={{ height: "68%" }}></span>
              <small>Fri</small>
            </div>

            <div className="chart-column">
              <span style={{ height: "88%" }}></span>
              <small>Sat</small>
            </div>

            <div className="chart-column">
              <span style={{ height: "72%" }}></span>
              <small>Sun</small>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   ALERTS SECTION
========================================================= */

function AlertsSection() {

  const [filter, setFilter] = useState("All");

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: "warning",
      icon: "!",
      title: "Pickup overdue",
      description:
        "Sharps waste from OT-02 requires collection.",
      time: "12 minutes ago",
      read: false,
    },
    {
      id: 2,
      type: "info",
      icon: "i",
      title: "AI review recommended",
      description:
        "2 waste classifications need manual review.",
      time: "34 minutes ago",
      read: false,
    },
    {
      id: 3,
      type: "success",
      icon: "✓",
      title: "Compliance target reached",
      description:
        "Today's segregation target is above 90%.",
      time: "1 hour ago",
      read: true,
    },
    {
      id: 4,
      type: "warning",
      icon: "!",
      title: "Waste bin nearing capacity",
      description:
        "Yellow category bin in Ward B is at 88%.",
      time: "2 hours ago",
      read: false,
    },
  ]);

  const markRead = (id) => {

    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id
          ? { ...alert, read: true }
          : alert
      )
    );
  };

  const filteredAlerts =
    filter === "All"
      ? alerts
      : filter === "Unread"
      ? alerts.filter((alert) => !alert.read)
      : alerts.filter((alert) => alert.type === filter);

  return (
    <div className="module-page">

      <div className="module-header">

        <div>
          <span className="panel-label">
            NOTIFICATIONS
          </span>

          <h2>Alerts & Notifications</h2>

          <p>
            Important updates requiring hospital staff attention.
          </p>
        </div>

        <button
          type="button"
          className="secondary-action"
          onClick={() =>
            setAlerts((prev) =>
              prev.map((alert) => ({
                ...alert,
                read: true,
              }))
            )
          }
        >
          ✓ Mark all read
        </button>

      </div>


      <div className="alert-filters">

        {["All", "Unread", "warning", "info", "success"].map(
          (item) => (

            <button
              key={item}
              type="button"
              className={
                filter === item
                  ? "filter-btn active"
                  : "filter-btn"
              }
              onClick={() => setFilter(item)}
            >
              {item === "All"
                ? "All"
                : item === "Unread"
                ? "Unread"
                : item.charAt(0).toUpperCase() +
                  item.slice(1)}
            </button>

          )
        )}

      </div>


      <div className="full-alert-list">

        {filteredAlerts.map((alert) => (

          <div
            key={alert.id}
            className={
              alert.read
                ? "full-alert-item read"
                : "full-alert-item"
            }
          >

            <div
              className={`alert-item-icon ${alert.type}`}
            >
              {alert.icon}
            </div>

            <div className="full-alert-content">

              <div className="full-alert-title">

                <strong>{alert.title}</strong>

                {!alert.read && (
                  <span className="new-dot">
                    NEW
                  </span>
                )}

              </div>

              <p>{alert.description}</p>

              <small>{alert.time}</small>

            </div>

            {!alert.read && (
              <button
                type="button"
                className="read-btn"
                onClick={() => markRead(alert.id)}
              >
                Mark read
              </button>
            )}

          </div>

        ))}

      </div>

    </div>
  );
}


function ProfileSection({
  hospitalName,
  adminName,
  hospitalEmail,
}) {
  return (
    <div className="module-page profile-page">
      <div className="module-header">
        <div>
          <span className="panel-label">ACCOUNT</span>
          <h2>My Profile</h2>
          <p>View your hospital account information.</p>
        </div>
      </div>

      <div className="profile-grid">
        <div className="panel profile-card-main">
          <div className="profile-large-avatar">
            {adminName.charAt(0).toUpperCase()}
          </div>
          <div className="profile-main-info">
            <h3>{adminName}</h3>
            <p>Hospital Staff</p>
            <span>{hospitalEmail}</span>
          </div>
        </div>

        <div className="panel profile-details-card">
          <div className="profile-detail-row">
            <span>Hospital</span>
            <strong>{hospitalName}</strong>
          </div>
          <div className="profile-detail-row">
            <span>Role</span>
            <strong>Hospital Staff</strong>
          </div>
          <div className="profile-detail-row">
            <span>Email</span>
            <strong>{hospitalEmail}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}


/* =========================================================
   SETTINGS SECTION
========================================================= */

function SettingsSection({
  hospitalName,
  adminName,
  hospitalEmail,
}) {

  const [name, setName] = useState(hospitalName);
  const [admin, setAdmin] = useState(adminName);
  const [email, setEmail] = useState(hospitalEmail);

  const [notifications, setNotifications] = useState(true);
  const [aiAlerts, setAiAlerts] = useState(true);
  const [pickupAlerts, setPickupAlerts] = useState(true);

  const saveSettings = () => {

    const existing =
      localStorage.getItem("biotrackHospital");

    let data = {};

    try {
      data = existing ? JSON.parse(existing) : {};
    } catch {
      data = {};
    }

    const updatedData = {
      ...data,
      hospitalName: name,
      contactPerson: admin,
      email: email,
    };

    localStorage.setItem(
      "biotrackHospital",
      JSON.stringify(updatedData)
    );

    alert(
      "Hospital settings saved successfully.\n\nRefresh the dashboard to see updated information."
    );
  };

  return (
    <div className="module-page">

      <div className="module-header">

        <div>
          <span className="panel-label">
            SYSTEM
          </span>

          <h2>Hospital Settings</h2>

          <p>
            Manage hospital information and notification preferences.
          </p>
        </div>

        <button
          type="button"
          className="primary-action"
          onClick={saveSettings}
        >
          Save Changes
        </button>

      </div>


      <div className="settings-grid">

        {/* HOSPITAL PROFILE */}

        <div className="panel settings-card">

          <div className="settings-card-header">
            <div className="settings-icon">
              🏥
            </div>

            <div>
              <h3>Hospital Profile</h3>
              <p>Basic hospital information</p>
            </div>
          </div>


          <div className="settings-form">

            <label>
              Hospital Name

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>


            <label>
              Administrator / Contact Person

              <input
                type="text"
                value={admin}
                onChange={(e) => setAdmin(e.target.value)}
              />
            </label>


            <label>
              Email Address

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

          </div>

        </div>


        {/* NOTIFICATIONS */}

        <div className="panel settings-card">

          <div className="settings-card-header">

            <div className="settings-icon">
              🔔
            </div>

            <div>
              <h3>Notifications</h3>
              <p>Control system alerts</p>
            </div>

          </div>


          <div className="toggle-list">

            <ToggleSetting
              title="System Notifications"
              description="Receive important system notifications"
              enabled={notifications}
              onChange={() =>
                setNotifications(!notifications)
              }
            />

            <ToggleSetting
              title="AI Review Alerts"
              description="Notify when AI classifications need review"
              enabled={aiAlerts}
              onChange={() =>
                setAiAlerts(!aiAlerts)
              }
            />

            <ToggleSetting
              title="Pickup Alerts"
              description="Notify about overdue or upcoming pickups"
              enabled={pickupAlerts}
              onChange={() =>
                setPickupAlerts(!pickupAlerts)
              }
            />

          </div>

        </div>


        {/* SECURITY */}

        <div className="panel settings-card">

          <div className="settings-card-header">

            <div className="settings-icon">
              🔐
            </div>

            <div>
              <h3>Security</h3>
              <p>Account security options</p>
            </div>

          </div>


          <div className="security-options">

            <button
              type="button"
              onClick={() =>
                alert(
                  "Password change module will be connected to the backend later."
                )
              }
            >
              Change Password
              <span>→</span>
            </button>

            <button
              type="button"
              onClick={() =>
                alert(
                  "Two-factor authentication will be connected to the backend later."
                )
              }
            >
              Two-Factor Authentication
              <span>→</span>
            </button>

          </div>

        </div>


        {/* SYSTEM STATUS */}

        <div className="panel settings-card">

          <div className="settings-card-header">

            <div className="settings-icon">
              ⚙
            </div>

            <div>
              <h3>System Status</h3>
              <p>BioTrack AI platform status</p>
            </div>

          </div>


          <div className="system-status-list">

            <div>
              <span>Application</span>
              <strong className="online">
                ● Online
              </strong>
            </div>

            <div>
              <span>AI Detection</span>
              <strong className="online">
                ● Ready
              </strong>
            </div>

            <div>
              <span>Database</span>
              <strong className="demo">
                ● Local Storage
              </strong>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   SMALL COMPONENTS
========================================================= */

function ScheduleItem({
  time,
  period,
  title,
  location,
  weight,
  status,
  statusClass,
}) {
  return (
    <div className="schedule-item">

      <div className="schedule-time">
        {time}
        <span>{period}</span>
      </div>

      <div className="schedule-line"></div>

      <div className="schedule-content">
        <strong>{title}</strong>

        <span>
          {location} • {weight}
        </span>
      </div>

      <span className={`status ${statusClass}`}>
        {status}
      </span>

    </div>
  );
}


function WasteBar({
  name,
  className,
  fillClass,
  width,
  weight,
}) {
  return (
    <div className="waste-row">

      <div className="waste-name">
        <span className={`waste-dot ${className}`}></span>
        {name}
      </div>

      <div className="bar">
        <div
          className={`bar-fill ${fillClass}`}
          style={{ width }}
        ></div>
      </div>

      <strong>{weight}</strong>

    </div>
  );
}


function AlertItem({
  type,
  icon,
  title,
  description,
  time,
}) {
  return (
    <div className={`alert-item ${type}`}>

      <div className="alert-item-icon">
        {icon}
      </div>

      <div>
        <strong>{title}</strong>

        <p>{description}</p>

        <small>{time}</small>
      </div>

    </div>
  );
}


function TimelineItem({
  active,
  title,
  description,
  time,
}) {
  return (
    <div
      className={
        active
          ? "timeline-item active"
          : "timeline-item"
      }
    >

      <div className="timeline-dot"></div>

      <div className="timeline-content">

        <strong>{title}</strong>

        <p>{description}</p>

        <small>{time}</small>

      </div>

    </div>
  );
}


function ToggleSetting({
  title,
  description,
  enabled,
  onChange,
}) {
  return (
    <div className="toggle-setting">

      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>

      <button
        type="button"
        className={
          enabled
            ? "toggle active"
            : "toggle"
        }
        onClick={onChange}
      >
        <span></span>
      </button>

    </div>
  );
}


export default HospitalDashboard;