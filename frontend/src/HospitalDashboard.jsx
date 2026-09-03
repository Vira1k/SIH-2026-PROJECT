import { useEffect, useMemo, useState } from "react";
import "./HospitalDashboard.css";
import AIDetection from "./AIDetection";
import WasteManagement from "./WasteManagement";
import CollectionSectionAPI from "./CollectionSection";
import TrackingSectionAPI from "./TrackingSection";
import AnalyticsSectionAPI from "./AnalyticsSection";
import AlertsSectionAPI from "./AlertsSection";

function HospitalDashboard() {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
      const [alertCount, setAlertCount] = useState(() => {
      const savedCount = localStorage.getItem("biotrackAlertUnreadCount");
      return savedCount ? Number(savedCount) : 0;
    });

    useEffect(() => {
      const syncAlertCount = () => {
        const savedCount = localStorage.getItem(
          "biotrackAlertUnreadCount"
        );

        setAlertCount(savedCount ? Number(savedCount) : 0);
      };

      syncAlertCount();

      window.addEventListener(
        "biotrack-alert-count-updated",
        syncAlertCount
      );

      return () => {
        window.removeEventListener(
          "biotrack-alert-count-updated",
          syncAlertCount
        );
      };
    }, []);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const handleMenuChange = (menu) => {
    setActiveMenu(menu);
    setIsSidebarOpen(false);
    setIsAccountOpen(false);
  };

  // Get hospital information saved during registration
  const [hospitalState, setHospitalState] = useState(() => {
    const savedHospital = localStorage.getItem("biotrackHospital");

    try {
      return savedHospital ? JSON.parse(savedHospital) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const syncHospital = () => {
      const savedHospital = localStorage.getItem("biotrackHospital");

      try {
        setHospitalState(
          savedHospital ? JSON.parse(savedHospital) : {}
        );
      } catch {
        setHospitalState({});
      }
    };

    window.addEventListener(
      "biotrack-hospital-updated",
      syncHospital
    );

    return () => {
      window.removeEventListener(
        "biotrack-hospital-updated",
        syncHospital
      );
    };
  }, []);

  const hospitalData = hospitalState;

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
            alertCount={alertCount}
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
          {alertCount > 0 && (
            <span className="mobile-notification-dot">
              {alertCount > 99 ? "99+" : alertCount}
            </span>
          )}
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

              {item.name === "Alerts" && alertCount > 0 && (
              <span className="alert-count">
                {alertCount > 99 ? "99+" : alertCount}
              </span>
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
            className="tutorial-card"
            onClick={() => setIsTutorialOpen(true)}
          >
            <div className="tutorial-icon">▶</div>

            <div>
              <strong>How to Use BioTrack AI?</strong>
              <span>Watch the quick tutorial</span>
            </div>
          </button>

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

      {isTutorialOpen && (
        <div
          className="tutorial-modal-backdrop"
          onClick={() => setIsTutorialOpen(false)}
          role="presentation"
        >
          <div
            className="tutorial-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tutorial-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="tutorial-modal-header">
              <div>
                <span className="tutorial-eyebrow">QUICK START GUIDE</span>
                <h2 id="tutorial-title">How to Use BioTrack AI</h2>
                <p>Learn the complete hospital waste-management workflow in a few minutes.</p>
              </div>

              <button
                type="button"
                className="tutorial-close-btn"
                onClick={() => setIsTutorialOpen(false)}
                aria-label="Close tutorial"
              >
                ×
              </button>
            </div>

            <div className="tutorial-video-wrap">
              <video
                className="tutorial-video"
                controls
                preload="metadata"
                src="/tutorial.mp4"
              >
                Your browser does not support the video player.
              </video>

              <div className="tutorial-video-placeholder">
                <div className="tutorial-placeholder-icon">▶</div>
                <strong>Tutorial video</strong>
                <p>
                  Add your recorded BioTrack AI tutorial as
                  <code>frontend/public/tutorial.mp4</code>
                  to play it here.
                </p>
              </div>
            </div>

            <div className="tutorial-steps">
              <div><b>01</b><span>Login &amp; Dashboard</span></div>
              <div><b>02</b><span>AI Waste Detection</span></div>
              <div><b>03</b><span>Waste &amp; Segregation</span></div>
              <div><b>04</b><span>Collection &amp; Tracking</span></div>
              <div><b>05</b><span>Analytics &amp; Alerts</span></div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


/* =========================================================
   DASHBOARD OVERVIEW
========================================================= */

function DashboardOverview({
  setActiveMenu,
  hospitalName,
  alertCount = 0,
}) {
  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const [wasteRecords, setWasteRecords] = useState([]);
  const [collectionRecords, setCollectionRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  const getToken = () => {
    return localStorage.getItem("biotrackToken");
  };

  const getArray = (payload, keys = []) => {
    if (Array.isArray(payload)) {
      return payload;
    }

    for (const key of keys) {
      if (Array.isArray(payload?.[key])) {
        return payload[key];
      }
    }

    return [];
  };

  const formatScheduleDate = (dateValue) => {
    if (!dateValue) {
      return {
        time: "--:--",
        period: "",
        date: "",
      };
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return {
        time: "--:--",
        period: "",
        date: "",
      };
    }

    const timeParts = new Intl.DateTimeFormat([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).formatToParts(date);

    const hour = timeParts.find((part) => part.type === "hour")?.value || "--";
    const minute =
      timeParts.find((part) => part.type === "minute")?.value || "--";
    const period =
      timeParts.find((part) => part.type === "dayPeriod")?.value || "";

    return {
      time: `${hour}:${minute}`,
      period,
      date: date.toLocaleDateString(),
    };
  };

  const formatRelativeTime = (dateValue) => {
    if (!dateValue) {
      return "Recently";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Recently";
    }

    const diff = Date.now() - date.getTime();

    if (diff < 0) {
      return "Upcoming";
    }

    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} min ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} hr ago`;
    }

    const days = Math.floor(hours / 24);

    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  const loadDashboardData = async () => {
    const token = getToken();

    if (!token) {
      setDashboardError("Authentication token not found.");
      setLoading(false);
      return;
    }

    try {
      setDashboardError("");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [wasteResponse, collectionsResponse] =
        await Promise.all([
          fetch(`${API_URL}/waste`, {
            headers,
          }),
          fetch(`${API_URL}/collections`, {
            headers,
          }),
        ]);

      if (!wasteResponse.ok) {
        throw new Error("Unable to load waste records.");
      }

      if (!collectionsResponse.ok) {
        throw new Error("Unable to load collection records.");
      }

      const wasteData = await wasteResponse.json();
      const collectionsData =
        await collectionsResponse.json();

      setWasteRecords(
        getArray(wasteData, [
          "data",
          "records",
          "waste",
        ])
      );

      setCollectionRecords(
        getArray(collectionsData, [
          "collections",
          "data",
          "records",
        ])
      );
    } catch (error) {
      console.error("Dashboard data loading error:", error);
      setDashboardError(
        error.message || "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    const interval = setInterval(() => {
      loadDashboardData();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const totalWaste = wasteRecords.reduce(
    (sum, record) => sum + Number(record.weight || 0),
    0
  );

  const collectedWaste = wasteRecords
    .filter(
      (record) =>
        record.status === "Collected" ||
        record.status === "Disposed"
    )
    .reduce(
      (sum, record) => sum + Number(record.weight || 0),
      0
    );

  const pendingWasteCount = wasteRecords.filter(
    (record) => record.status === "Pending"
  ).length;

  const processingWasteCount = wasteRecords.filter(
    (record) => record.status === "Processing"
  ).length;

  const disposedWasteCount = wasteRecords.filter(
    (record) => record.status === "Disposed"
  ).length;

  const scheduledCollections = collectionRecords.filter(
    (collection) => collection.status === "Scheduled"
  );

  const completedCollections = collectionRecords.filter(
    (collection) => collection.status === "Completed"
  );

  const nonCancelledCollections = collectionRecords.filter(
    (collection) => collection.status !== "Cancelled"
  );

  const collectionCompliance =
    nonCancelledCollections.length > 0
      ? Math.round(
          (completedCollections.length /
            nonCancelledCollections.length) *
            100
        )
      : 0;

  const aiRecords = wasteRecords.filter((record) => {
    const confidence = Number(record.aiConfidence);
    return Number.isFinite(confidence) && confidence >= 0;
  });

  const averageAIConfidence =
    aiRecords.length > 0
      ? Math.round(
          (aiRecords.reduce(
            (sum, record) =>
              sum + Math.min(Number(record.aiConfidence), 1),
            0
          ) /
            aiRecords.length) *
            100
        )
      : null;

  const isToday = (dateValue) => {
    if (!dateValue) {
      return false;
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return false;
    }

    const today = new Date();

    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const todaysCollections = collectionRecords
    .filter((collection) =>
      isToday(collection.scheduledDate)
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledDate || 0).getTime() -
        new Date(b.scheduledDate || 0).getTime()
    )
    .slice(0, 4);

  const binTotals = {
    Yellow: 0,
    Red: 0,
    White: 0,
    Blue: 0,
  };

  wasteRecords.forEach((record) => {
    if (Object.prototype.hasOwnProperty.call(binTotals, record.bin)) {
      binTotals[record.bin] += Number(record.weight || 0);
    }
  });

  const maxBinWeight = Math.max(
    ...Object.values(binTotals),
    1
  );

  const dashboardAlerts = useMemo(() => {
    const generated = [];

    collectionRecords.forEach((collection) => {
      if (
        collection.status === "Scheduled" &&
        collection.scheduledDate &&
        new Date(collection.scheduledDate).getTime() <
          Date.now()
      ) {
        generated.push({
          type: "warning",
          icon: "!",
          title: "Pickup overdue",
          description: `${
            collection.waste?.wasteId || "Waste"
          } is awaiting collection.`,
          time: formatRelativeTime(collection.scheduledDate),
          priority: 1,
        });
      }
    });

    wasteRecords.forEach((waste) => {
      if (waste.status === "Pending") {
        generated.push({
          type: "warning",
          icon: "!",
          title: "Waste awaiting collection",
          description: `${
            waste.wasteId || "Waste record"
          } is still pending collection.`,
          time: formatRelativeTime(waste.createdAt),
          priority: 2,
        });
      }

      if (waste.status === "Processing") {
        generated.push({
          type: "info",
          icon: "i",
          title: "Waste processing in progress",
          description: `${
            waste.wasteId || "Waste record"
          } is currently being processed.`,
          time: formatRelativeTime(waste.updatedAt),
          priority: 3,
        });
      }

      const confidence = Number(waste.aiConfidence);

      if (
        waste.aiDetected === true &&
        Number.isFinite(confidence) &&
        confidence < 0.85
      ) {
        generated.push({
          type: "info",
          icon: "i",
          title: "AI review recommended",
          description: `${
            waste.wasteId || "Waste record"
          } has an AI confidence of ${Math.round(
            confidence * 100
          )}%.`,
          time: formatRelativeTime(waste.updatedAt || waste.createdAt),
          priority: 2,
        });
      }
    });

    collectionRecords.forEach((collection) => {
      if (collection.status === "Completed") {
        generated.push({
          type: "success",
          icon: "✓",
          title: "Collection completed",
          description: `${
            collection.waste?.wasteId ||
            "Waste record"
          } completed the collection workflow.`,
          time: formatRelativeTime(
            collection.completedAt ||
              collection.updatedAt
          ),
          priority: 4,
        });
      }
    });

    generated.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }

      return 0;
    });

    return generated.slice(0, 3);
  }, [wasteRecords, collectionRecords]);

  const getStatusClass = (status) => {
    if (status === "Completed") {
      return "completed";
    }

    if (status === "Scheduled") {
      return "pending";
    }

    if (status === "Cancelled") {
      return "pending";
    }

    return "upcoming";
  };

  const getCollectionTitle = (collection) => {
    return (
      collection.waste?.category ||
      collection.waste?.type ||
      "Biomedical Waste"
    );
  };

  return (
    <>
      {/* STAT CARDS */}

      <section className="overview-grid">
        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon waste-stat">♻</div>
            <span className="trend positive">
              Live
            </span>
          </div>

          <p>Waste Collected</p>

          <h2>
            {loading
              ? "—"
              : collectedWaste.toFixed(1)}{" "}
            <span>kg</span>
          </h2>

          <small>
            {totalWaste.toFixed(1)} kg total recorded
          </small>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon ai-stat">AI</div>
            <span className="trend neutral">
              {averageAIConfidence !== null
                ? "Live"
                : "Awaiting AI"}
            </span>
          </div>

          <p>AI Confidence</p>

          <h2>
            {loading
              ? "—"
              : averageAIConfidence !== null
              ? averageAIConfidence
              : "—"}
            <span>
              {averageAIConfidence !== null ? "%" : ""}
            </span>
          </h2>

          <small>
            Average of available AI confidence records
          </small>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon pickup-stat">▣</div>
            <span className="trend neutral">
              Today
            </span>
          </div>

          <p>Pending Pickups</p>

          <h2>
            {loading
              ? "—"
              : String(scheduledCollections.length).padStart(
                  2,
                  "0"
                )}
          </h2>

          <small>
            {pendingWasteCount} waste record
            {pendingWasteCount !== 1 ? "s" : ""} awaiting collection
          </small>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon compliance-stat">
              ✓
            </div>
            <span className="trend positive">
              Live
            </span>
          </div>

          <p>Collection Completion</p>

          <h2>
            {loading ? "—" : collectionCompliance}
            <span>%</span>
          </h2>

          <small>
            Completed collections ÷ active collections
          </small>
        </div>
      </section>

      {dashboardError && (
        <div
          className="dashboard-info-strip"
          style={{ marginBottom: "20px" }}
        >
          <span>⚠</span>
          <div>
            <strong>Dashboard data unavailable</strong>
            <p>{dashboardError}</p>
          </div>
          <button
            type="button"
            className="view-all-btn"
            onClick={() => {
              setLoading(true);
              loadDashboardData();
            }}
          >
            Retry
          </button>
        </div>
      )}

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
              <div className="upload-icon">↑</div>

              <h3>Scan Waste</h3>

              <p>
                Upload an image of waste for AI
                classification.
              </p>

              <button
                type="button"
                className="upload-btn"
                onClick={() => setActiveMenu("AI Detect")}
              >
                Open AI Detection
              </button>

              <span>JPG, PNG up to 10MB</span>
            </div>

            <div className="detection-info">
              <div className="detection-placeholder">
                <div className="scan-circle">✦</div>

                <strong>AI Classification</strong>

                <p>
                  Open AI Detection to analyze biomedical
                  waste.
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
            {todaysCollections.length === 0 ? (
              <div className="detection-placeholder">
                <div className="scan-circle">✓</div>

                <strong>
                  No collections scheduled today
                </strong>

                <p>
                  New pickup requests will appear here
                  automatically.
                </p>
              </div>
            ) : (
              todaysCollections.map((collection) => {
                const schedule = formatScheduleDate(
                  collection.scheduledDate
                );

                const waste = collection.waste || {};

                return (
                  <ScheduleItem
                    key={collection._id}
                    time={schedule.time}
                    period={schedule.period}
                    title={getCollectionTitle(
                      collection
                    )}
                    location={
                      waste.department ||
                      "Hospital"
                    }
                    weight={`${Number(
                      waste.weight || 0
                    ).toFixed(1)} kg`}
                    status={collection.status}
                    statusClass={getStatusClass(
                      collection.status
                    )}
                  />
                );
              })
            )}
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
              width={`${Math.round(
                (binTotals.Yellow / maxBinWeight) * 100
              )}%`}
              weight={`${binTotals.Yellow.toFixed(1)} kg`}
            />

            <WasteBar
              name="Red Category"
              className="red"
              fillClass="red-fill"
              width={`${Math.round(
                (binTotals.Red / maxBinWeight) * 100
              )}%`}
              weight={`${binTotals.Red.toFixed(1)} kg`}
            />

            <WasteBar
              name="White Category"
              className="white"
              fillClass="white-fill"
              width={`${Math.round(
                (binTotals.White / maxBinWeight) * 100
              )}%`}
              weight={`${binTotals.White.toFixed(1)} kg`}
            />

            <WasteBar
              name="Blue Category"
              className="blue"
              fillClass="blue-fill"
              width={`${Math.round(
                (binTotals.Blue / maxBinWeight) * 100
              )}%`}
              weight={`${binTotals.Blue.toFixed(1)} kg`}
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
              {alertCount > 0
                ? `${alertCount > 99 ? "99+" : alertCount} New`
                : "No New"}
            </button>
          </div>

          <div className="alert-list">
            {dashboardAlerts.length === 0 ? (
              <div className="detection-placeholder">
                <div className="scan-circle">✓</div>

                <strong>No active alerts</strong>

                <p>
                  Your current waste and collection
                  records require no attention.
                </p>
              </div>
            ) : (
              dashboardAlerts.map((alert, index) => (
                <AlertItem
                  key={`${alert.title}-${index}`}
                  type={alert.type}
                  icon={alert.icon}
                  title={alert.title}
                  description={alert.description}
                  time={alert.time}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* LIVE SUMMARY */}

      <div className="dashboard-info-strip">
        <span>📊</span>

        <div>
          <strong>Live Operations Summary</strong>
          <p>
            {wasteRecords.length} waste record
            {wasteRecords.length !== 1 ? "s" : ""} •{" "}
            {processingWasteCount} processing •{" "}
            {disposedWasteCount} disposed •{" "}
            {scheduledCollections.length} scheduled pickup
            {scheduledCollections.length !== 1 ? "s" : ""}
          </p>
        </div>

        <button
          type="button"
          className="view-all-btn"
          onClick={() => {
            setLoading(true);
            loadDashboardData();
          }}
        >
          Refresh
        </button>
      </div>

      {/* HOSPITAL INFO */}

      <div className="dashboard-info-strip">
        <span>🏥</span>

        <div>
          <strong>{hospitalName}</strong>
          <p>
            BioTrack AI Hospital Waste Management System
          </p>
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
  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const [profile, setProfile] = useState({
    hospitalName,
    adminName,
    email: hospitalEmail,
    registrationNumber: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    role: "Hospital Staff",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("biotrackToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load profile.");
        }

        const hospital = data.hospital || data.data || data;

        setProfile({
          hospitalName: hospital.hospitalName || hospitalName,
          adminName:
            hospital.adminName ||
            hospital.contactPerson ||
            adminName,
          email: hospital.email || hospitalEmail,
          registrationNumber: hospital.registrationNumber || "",
          phone: hospital.phone || "",
          address: hospital.address || "",
          city: hospital.city || "",
          state: hospital.state || "",
          pincode: hospital.pincode || "",
          role: hospital.role || "Hospital Staff",
        });
      } catch (err) {
        console.error("Profile loading error:", err);
        setError(err.message || "Unable to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [API_URL, hospitalName, adminName, hospitalEmail]);

  return (
    <div className="module-page profile-page">
      <div className="module-header">
        <div>
          <span className="panel-label">ACCOUNT</span>
          <h2>My Profile</h2>
          <p>View your hospital account information.</p>
        </div>
      </div>

      {error && (
        <div className="dashboard-info-strip">
          <span>⚠</span>
          <div>
            <strong>Profile could not be loaded from server</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="profile-grid">
        <div className="panel profile-card-main">
          <div className="profile-large-avatar">
            {(profile.adminName || "H").charAt(0).toUpperCase()}
          </div>

          <div className="profile-main-info">
            <h3>{profile.adminName || "Hospital Admin"}</h3>
            <p>{profile.role || "Hospital Staff"}</p>
            <span>{profile.email || "—"}</span>
          </div>
        </div>

        <div className="panel profile-details-card">
          {[
            ["Hospital", profile.hospitalName],
            ["Registration Number", profile.registrationNumber],
            ["Administrator", profile.adminName],
            ["Role", profile.role],
            ["Email", profile.email],
            ["Phone", profile.phone],
            ["Address", profile.address],
            ["City", profile.city],
            ["State", profile.state],
            ["Pincode", profile.pincode],
          ].map(([label, value]) => (
            <div className="profile-detail-row" key={label}>
              <span>{label}</span>
              <strong>{loading ? "Loading..." : value || "—"}</strong>
            </div>
          ))}
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
  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const [name, setName] = useState(hospitalName);
  const [admin, setAdmin] = useState(adminName);
  const [email, setEmail] = useState(hospitalEmail);

  const [notifications, setNotifications] = useState(true);
  const [aiAlerts, setAiAlerts] = useState(true);
  const [pickupAlerts, setPickupAlerts] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      const token = localStorage.getItem("biotrackToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load settings.");
        }

        const hospital = data.hospital || data.data || data;

        setName(hospital.hospitalName || hospitalName);
        setAdmin(
          hospital.adminName ||
            hospital.contactPerson ||
            adminName
        );
        setEmail(hospital.email || hospitalEmail);

        setNotifications(
          hospital.notifications !== false
        );
        setAiAlerts(hospital.aiAlerts !== false);
        setPickupAlerts(hospital.pickupAlerts !== false);
      } catch (err) {
        console.error("Settings loading error:", err);
        setError(err.message || "Unable to load settings.");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [API_URL, hospitalName, adminName, hospitalEmail]);

  const saveSettings = async () => {
    const token = localStorage.getItem("biotrackToken");

    if (!token) {
      setError("Authentication token not found. Please log in again.");
      return;
    }

    if (!name.trim() || !admin.trim() || !email.trim()) {
      setError(
        "Hospital name, administrator name and email are required."
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hospitalName: name.trim(),
          adminName: admin.trim(),
          email: email.trim(),
          notifications,
          aiAlerts,
          pickupAlerts,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to save hospital settings."
        );
      }

      const hospital = data.hospital || data.data || data;

      localStorage.setItem(
        "biotrackHospital",
        JSON.stringify(hospital)
      );

      window.dispatchEvent(
        new CustomEvent("biotrack-hospital-updated")
      );

      alert("Hospital settings saved successfully.");
    } catch (err) {
      console.error("Settings save error:", err);
      setError(err.message || "Unable to save hospital settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="module-page">
      <div className="module-header">
        <div>
          <span className="panel-label">SYSTEM</span>
          <h2>Hospital Settings</h2>
          <p>
            Manage hospital information and notification preferences.
          </p>
        </div>

        <button
          type="button"
          className="primary-action"
          onClick={saveSettings}
          disabled={saving || loading}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {error && (
        <div className="dashboard-info-strip">
          <span>⚠</span>
          <div>
            <strong>Settings error</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="settings-grid">
        <div className="panel settings-card">
          <div className="settings-card-header">
            <div className="settings-icon">🏥</div>
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
                disabled={loading || saving}
              />
            </label>

            <label>
              Administrator / Contact Person
              <input
                type="text"
                value={admin}
                onChange={(e) => setAdmin(e.target.value)}
                disabled={loading || saving}
              />
            </label>

            <label>
              Email Address
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || saving}
              />
            </label>
          </div>
        </div>

        <div className="panel settings-card">
          <div className="settings-card-header">
            <div className="settings-icon">🔔</div>
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
                setNotifications((prev) => !prev)
              }
            />

            <ToggleSetting
              title="AI Review Alerts"
              description="Notify when AI classifications need review"
              enabled={aiAlerts}
              onChange={() =>
                setAiAlerts((prev) => !prev)
              }
            />

            <ToggleSetting
              title="Pickup Alerts"
              description="Notify about overdue or upcoming pickups"
              enabled={pickupAlerts}
              onChange={() =>
                setPickupAlerts((prev) => !prev)
              }
            />
          </div>
        </div>

        <div className="panel settings-card">
          <div className="settings-card-header">
            <div className="settings-icon">🔐</div>
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
                  "Password change module is not connected yet."
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
                  "Two-factor authentication is not connected yet."
                )
              }
            >
              Two-Factor Authentication
              <span>→</span>
            </button>
          </div>
        </div>

        <div className="panel settings-card">
          <div className="settings-card-header">
            <div className="settings-icon">⚙</div>
            <div>
              <h3>System Status</h3>
              <p>BioTrack AI platform status</p>
            </div>
          </div>

          <div className="system-status-list">
            <div>
              <span>Application</span>
              <strong className="online">● Online</strong>
            </div>

            <div>
              <span>Backend API</span>
              <strong className="online">● Connected</strong>
            </div>

            <div>
              <span>AI Detection</span>
              <strong className="online">● Ready</strong>
            </div>

            <div>
              <span>Database</span>
              <strong className="online">● MongoDB</strong>
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