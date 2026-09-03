import { useCallback, useEffect, useMemo, useState } from "react";
import "./AlertsSection.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const READ_STORAGE_KEY = "biotrackReadAlerts";

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
    const minutes = Math.floor(Math.abs(diff) / 60000);

    if (minutes < 1) {
      return "Starting soon";
    }

    if (minutes < 60) {
      return `Starts in ${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `Starts in ${hours} hr`;
    }

    const days = Math.floor(hours / 24);

    return `Starts in ${days} day${days > 1 ? "s" : ""}`;
  }

  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  return date.toLocaleDateString();
};

const formatDateTime = (dateValue) => {
  if (!dateValue) {
    return "Not available";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const readStoredAlerts = () => {
  try {
    const stored = localStorage.getItem(READ_STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveReadAlerts = (ids) => {
  try {
    localStorage.setItem(
      READ_STORAGE_KEY,
      JSON.stringify(ids)
    );
  } catch {
    // Ignore localStorage errors.
  }
};

function AlertsSection() {
  const [filter, setFilter] = useState("All");

  const [alerts, setAlerts] = useState([]);
  useEffect(() => {
  const unreadCount = alerts.filter(
    (alert) => !alert.read
  ).length;

  localStorage.setItem(
    "biotrackAlertUnreadCount",
    String(unreadCount)
  );

  window.dispatchEvent(
    new CustomEvent("biotrack-alert-count-updated")
  );
}, [alerts]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [readAlertIds, setReadAlertIds] = useState(
    readStoredAlerts
  );

  const loadAlerts = useCallback(async (isRefresh = false) => {
    const token = getToken();

    if (!token) {
      setError("Authentication token not found. Please login again.");
      setLoading(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
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

      const wasteRecords = getArray(wasteData, [
        "data",
        "records",
        "waste",
      ]);

      const collectionRecords = getArray(
        collectionsData,
        [
          "collections",
          "data",
          "records",
        ]
      );

      const generatedAlerts = [];

      // =====================================================
      // 1. OVERDUE PICKUPS
      // =====================================================

      collectionRecords.forEach((collection) => {
        const status = collection.status;

        const scheduledDate = collection.scheduledDate;

        if (
          status === "Scheduled" &&
          scheduledDate &&
          new Date(scheduledDate).getTime() < Date.now()
        ) {
          const waste = collection.waste;

          const wasteId =
            waste?.wasteId || "Unknown waste";

          const collectionId =
            collection.collectionId || "Unknown collection";

          const alertId = `overdue-${collection._id}`;

          generatedAlerts.push({
            id: alertId,
            type: "warning",
            icon: "!",
            title: "Pickup overdue",
            description: `${wasteId} was scheduled for collection but has not been collected yet.`,
            time: formatRelativeTime(scheduledDate),
            date: scheduledDate,
            priority: 1,
            meta: `Collection ${collectionId}`,
          });
        }
      });

      // =====================================================
      // 2. WASTE WAITING FOR COLLECTION
      // =====================================================

      wasteRecords.forEach((waste) => {
        if (waste.status === "Pending") {
          const alertId = `pending-${waste._id}`;

          generatedAlerts.push({
            id: alertId,
            type: "warning",
            icon: "!",
            title: "Waste awaiting collection",
            description: `${waste.wasteId || "Waste record"} is still pending collection.`,
            time: formatRelativeTime(waste.createdAt),
            date: waste.createdAt,
            priority: 2,
            meta: `${waste.category || "Waste"} • ${waste.weight || 0} kg`,
          });
        }
      });

      // =====================================================
      // 3. AI REVIEW RECOMMENDED
      // =====================================================

      wasteRecords.forEach((waste) => {
        const confidence =
          typeof waste.aiConfidence === "number"
            ? waste.aiConfidence
            : null;

        const lowConfidence =
          confidence !== null && confidence < 0.85;

        const aiNeedsReview =
          waste.aiDetected === true && lowConfidence;

        if (aiNeedsReview) {
          const confidencePercent =
            Math.round(confidence * 100);

          const alertId = `ai-review-${waste._id}`;

          generatedAlerts.push({
            id: alertId,
            type: "info",
            icon: "i",
            title: "AI review recommended",
            description: `${waste.wasteId || "Waste record"} has low AI confidence and should be manually reviewed.`,
            time: formatRelativeTime(waste.updatedAt),
            date: waste.updatedAt,
            priority: 3,
            meta: `AI confidence ${confidencePercent}%`,
          });
        }
      });

      // =====================================================
      // 4. COLLECTION COMPLETED
      // =====================================================

      collectionRecords.forEach((collection) => {
        if (collection.status === "Completed") {
          const waste = collection.waste;

          const wasteId =
            waste?.wasteId || "Waste record";

          const completedDate =
            collection.completedAt ||
            collection.updatedAt;

          const alertId = `completed-${collection._id}`;

          generatedAlerts.push({
            id: alertId,
            type: "success",
            icon: "✓",
            title: "Collection completed",
            description: `${wasteId} has completed the collection and disposal workflow.`,
            time: formatRelativeTime(completedDate),
            date: completedDate,
            priority: 4,
            meta:
              collection.collectionId ||
              "Collection completed",
          });
        }
      });

      // =====================================================
      // 5. PROCESSING WASTE
      // =====================================================

      wasteRecords.forEach((waste) => {
        if (waste.status === "Processing") {
          const alertId = `processing-${waste._id}`;

          generatedAlerts.push({
            id: alertId,
            type: "info",
            icon: "i",
            title: "Waste processing in progress",
            description: `${waste.wasteId || "Waste record"} is currently being processed.`,
            time: formatRelativeTime(waste.updatedAt),
            date: waste.updatedAt,
            priority: 5,
            meta: `${waste.category || "Waste"} • ${waste.weight || 0} kg`,
          });
        }
      });

      // =====================================================
      // SORT
      // =====================================================

      generatedAlerts.sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }

        const dateA = new Date(a.date || 0).getTime();

        const dateB = new Date(b.date || 0).getTime();

        return dateB - dateA;
      });

      setAlerts(generatedAlerts);
    } catch (err) {
      console.error("Alerts loading error:", err);

      setError(
        err.message ||
          "Unable to load alerts. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  // =========================================================
  // AUTO REFRESH EVERY 30 SECONDS
  // =========================================================

  useEffect(() => {
    const interval = setInterval(() => {
      loadAlerts(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [loadAlerts]);

  // =========================================================
  // MARK ONE ALERT READ
  // =========================================================

  const markRead = (id) => {
    setReadAlertIds((previous) => {
      if (previous.includes(id)) {
        return previous;
      }

      const updated = [...previous, id];

      saveReadAlerts(updated);

      return updated;
    });
  };

  // =========================================================
  // MARK ALL READ
  // =========================================================

  const markAllRead = () => {
    const allIds = alerts.map((alert) => alert.id);

    setReadAlertIds(allIds);

    saveReadAlerts(allIds);
  };

  // =========================================================
  // CLEAR READ HISTORY FOR CURRENT ALERTS
  // =========================================================

  const clearReadHistory = () => {
    setReadAlertIds([]);

    saveReadAlerts([]);
  };

  // =========================================================
  // FILTER
  // =========================================================

  const filteredAlerts = useMemo(() => {
    if (filter === "All") {
      return alerts;
    }

    if (filter === "Unread") {
      return alerts.filter(
        (alert) => !readAlertIds.includes(alert.id)
      );
    }

    return alerts.filter(
      (alert) => alert.type === filter
    );
  }, [alerts, filter, readAlertIds]);

  const unreadCount = useMemo(() => {
    return alerts.filter(
      (alert) => !readAlertIds.includes(alert.id)
    ).length;
  }, [alerts, readAlertIds]);

  const warningCount = useMemo(() => {
    return alerts.filter(
      (alert) => alert.type === "warning"
    ).length;
  }, [alerts]);

  const infoCount = useMemo(() => {
    return alerts.filter(
      (alert) => alert.type === "info"
    ).length;
  }, [alerts]);

  const successCount = useMemo(() => {
    return alerts.filter(
      (alert) => alert.type === "success"
    ).length;
  }, [alerts]);

  return (
    <div className="alerts-page">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="alerts-header">
        <div>
          <span className="alerts-panel-label">
            NOTIFICATIONS
          </span>

          <h2>Alerts & Notifications</h2>

          <p>
            Real-time updates requiring hospital staff
            attention.
          </p>
        </div>

        <div className="alerts-header-actions">
          <button
            type="button"
            className="alerts-refresh-btn"
            onClick={() => loadAlerts(true)}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "↻ Refresh"}
          </button>

          <button
            type="button"
            className="alerts-mark-all-btn"
            onClick={markAllRead}
            disabled={alerts.length === 0}
          >
            ✓ Mark all read
          </button>
        </div>
      </div>

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="alerts-summary">
        <div className="alert-summary-card unread">
          <span className="summary-icon">!</span>

          <div>
            <small>Unread</small>
            <strong>{unreadCount}</strong>
          </div>
        </div>

        <div className="alert-summary-card warning">
          <span className="summary-icon">!</span>

          <div>
            <small>Warnings</small>
            <strong>{warningCount}</strong>
          </div>
        </div>

        <div className="alert-summary-card info">
          <span className="summary-icon">i</span>

          <div>
            <small>Information</small>
            <strong>{infoCount}</strong>
          </div>
        </div>

        <div className="alert-summary-card success">
          <span className="summary-icon">✓</span>

          <div>
            <small>Completed</small>
            <strong>{successCount}</strong>
          </div>
        </div>
      </div>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div className="alerts-filter-row">
        {[
          "All",
          "Unread",
          "warning",
          "info",
          "success",
        ].map((item) => {
          const label =
            item === "warning"
              ? "Warning"
              : item === "info"
              ? "Info"
              : item === "success"
              ? "Success"
              : item;

          return (
            <button
              key={item}
              type="button"
              className={
                filter === item
                  ? "alerts-filter-btn active"
                  : "alerts-filter-btn"
              }
              onClick={() => setFilter(item)}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="alerts-error">
          <div>
            <strong>Unable to load alerts</strong>
            <p>{error}</p>
          </div>

          <button
            type="button"
            onClick={() => loadAlerts()}
          >
            Try again
          </button>
        </div>
      )}

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading ? (
        <div className="alerts-loading">
          <div className="alerts-spinner"></div>

          <strong>Loading alerts...</strong>

          <span>
            Checking waste and collection activity.
          </span>
        </div>
      ) : (
        <>
          {/* =================================================
              ALERT LIST
          ================================================= */}

          <div className="alerts-list">
            {filteredAlerts.length === 0 ? (
              <div className="alerts-empty">
                <div className="alerts-empty-icon">✓</div>

                <h3>
                  {filter === "Unread"
                    ? "You're all caught up"
                    : "No alerts found"}
                </h3>

                <p>
                  {filter === "Unread"
                    ? "There are no unread notifications right now."
                    : "No notifications match the selected filter."}
                </p>

                {filter !== "All" && (
                  <button
                    type="button"
                    onClick={() => setFilter("All")}
                  >
                    View all alerts
                  </button>
                )}
              </div>
            ) : (
              filteredAlerts.map((alert) => {
                const isRead = readAlertIds.includes(
                  alert.id
                );

                return (
                  <div
                    key={alert.id}
                    className={
                      isRead
                        ? `alerts-item ${alert.type} read`
                        : `alerts-item ${alert.type}`
                    }
                  >
                    <div
                      className={`alerts-item-icon ${alert.type}`}
                    >
                      {alert.icon}
                    </div>

                    <div className="alerts-item-content">
                      <div className="alerts-item-top">
                        <div>
                          <span
                            className={`alerts-type-badge ${alert.type}`}
                          >
                            {alert.type === "warning"
                              ? "WARNING"
                              : alert.type === "info"
                              ? "INFO"
                              : "SUCCESS"}
                          </span>

                          <h3>{alert.title}</h3>
                        </div>

                        {!isRead && (
                          <span className="alerts-new-dot">
                            NEW
                          </span>
                        )}
                      </div>

                      <p>{alert.description}</p>

                      <div className="alerts-item-meta">
                        <span>
                          {alert.meta}
                        </span>

                        <span>•</span>

                        <span>
                          {alert.time}
                        </span>
                      </div>
                    </div>

                    <div className="alerts-item-actions">
                      {!isRead ? (
                        <button
                          type="button"
                          onClick={() =>
                            markRead(alert.id)
                          }
                        >
                          Mark read
                        </button>
                      ) : (
                        <span className="alerts-read-label">
                          ✓ Read
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          {alerts.length > 0 && (
            <div className="alerts-footer">
              <span>
                Showing {filteredAlerts.length} of{" "}
                {alerts.length} alert
                {alerts.length !== 1 ? "s" : ""}
              </span>

              {readAlertIds.length > 0 && (
                <button
                  type="button"
                  onClick={clearReadHistory}
                >
                  Reset read status
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AlertsSection;