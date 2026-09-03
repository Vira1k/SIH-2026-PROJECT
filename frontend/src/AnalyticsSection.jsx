import { useEffect, useMemo, useState } from "react";
import "./AnalyticsSection.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const BIN_ORDER = ["Yellow", "Red", "White", "Blue"];

const STATUS_ORDER = [
  "Pending",
  "Processing",
  "Collected",
  "Disposed",
];

const formatNumber = (value, decimals = 1) => {
  const number = Number(value || 0);

  return number.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

const getWasteList = (data) => {
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.records)) return data.records;
  if (Array.isArray(data?.waste)) return data.waste;
  return [];
};

const getCollectionList = (data) => {
  if (Array.isArray(data?.collections)) return data.collections;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.records)) return data.records;
  return [];
};

function AnalyticsSection() {
  const [wasteRecords, setWasteRecords] = useState([]);
  const [collections, setCollections] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const token = localStorage.getItem("biotrackToken");

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [wasteResponse, collectionResponse] = await Promise.all([
        fetch(`${API_URL}/waste`, {
          headers,
        }),

        fetch(`${API_URL}/collections`, {
          headers,
        }),
      ]);

      const wasteData = await wasteResponse.json();
      const collectionData = await collectionResponse.json();

      if (!wasteResponse.ok) {
        throw new Error(
          wasteData?.message || "Failed to load waste analytics."
        );
      }

      if (!collectionResponse.ok) {
        throw new Error(
          collectionData?.message ||
            "Failed to load collection analytics."
        );
      }

      setWasteRecords(getWasteList(wasteData));
      setCollections(getCollectionList(collectionData));
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Analytics error:", err);

      setError(
        err.message || "Unable to load analytics data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  /* =========================================================
     MAIN METRICS
  ========================================================= */

  const metrics = useMemo(() => {
    const totalWaste = wasteRecords.reduce(
      (sum, record) => sum + Number(record.weight || 0),
      0
    );

    const totalRecords = wasteRecords.length;

    const disposedWaste = wasteRecords
      .filter((record) => record.status === "Disposed")
      .reduce(
        (sum, record) => sum + Number(record.weight || 0),
        0
      );

    const collectedWaste = wasteRecords
      .filter((record) => record.status === "Collected")
      .reduce(
        (sum, record) => sum + Number(record.weight || 0),
        0
      );

    const completedCollections = collections.filter(
      (collection) => collection.status === "Completed"
    ).length;

    const collectionRate =
      collections.length > 0
        ? (completedCollections / collections.length) * 100
        : 0;

    const aiRecords = wasteRecords.filter(
      (record) =>
        record.aiDetected === true &&
        record.aiConfidence !== null &&
        record.aiConfidence !== undefined
    );

    const aiAccuracy =
      aiRecords.length > 0
        ? aiRecords.reduce(
            (sum, record) =>
              sum + Number(record.aiConfidence || 0),
            0
          ) / aiRecords.length
        : 0;

    return {
      totalWaste,
      totalRecords,
      disposedWaste,
      collectedWaste,
      completedCollections,
      collectionRate,
      aiAccuracy,
    };
  }, [wasteRecords, collections]);

  /* =========================================================
     BIN ANALYTICS
  ========================================================= */

  const binAnalytics = useMemo(() => {
    return BIN_ORDER.map((bin) => {
      const records = wasteRecords.filter(
        (record) => record.bin === bin
      );

      const weight = records.reduce(
        (sum, record) =>
          sum + Number(record.weight || 0),
        0
      );

      return {
        name: bin,
        count: records.length,
        weight,
      };
    });
  }, [wasteRecords]);

  const maxBinWeight = Math.max(
    ...binAnalytics.map((item) => item.weight),
    1
  );

  /* =========================================================
     STATUS ANALYTICS
  ========================================================= */

  const statusAnalytics = useMemo(() => {
    return STATUS_ORDER.map((status) => {
      const records = wasteRecords.filter(
        (record) => record.status === status
      );

      const weight = records.reduce(
        (sum, record) =>
          sum + Number(record.weight || 0),
        0
      );

      return {
        status,
        count: records.length,
        weight,
      };
    });
  }, [wasteRecords]);

  /* =========================================================
     DEPARTMENT ANALYTICS
  ========================================================= */

  const departmentAnalytics = useMemo(() => {
    const departmentMap = {};

    wasteRecords.forEach((record) => {
      const department =
        record.department?.trim() || "Unknown";

      if (!departmentMap[department]) {
        departmentMap[department] = {
          department,
          count: 0,
          weight: 0,
        };
      }

      departmentMap[department].count += 1;

      departmentMap[department].weight += Number(
        record.weight || 0
      );
    });

    return Object.values(departmentMap)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 8);
  }, [wasteRecords]);

  const maxDepartmentWeight = Math.max(
    ...departmentAnalytics.map((item) => item.weight),
    1
  );

  /* =========================================================
     REPORT EXPORT
  ========================================================= */

  const generateReport = () => {
    if (wasteRecords.length === 0) {
      alert("No analytics data available to export.");
      return;
    }

    const rows = [
      [
        "Waste ID",
        "Type",
        "Category",
        "Bin",
        "Weight (kg)",
        "Department",
        "Status",
        "AI Detected",
        "AI Confidence",
        "Created At",
      ],
    ];

    wasteRecords.forEach((record) => {
      rows.push([
        record.wasteId || "",
        record.type || "",
        record.category || "",
        record.bin || "",
        record.weight || 0,
        record.department || "",
        record.status || "",
        record.aiDetected ? "Yes" : "No",
        record.aiConfidence ?? "",
        record.createdAt
          ? new Date(record.createdAt).toLocaleString()
          : "",
      ]);
    });

    const csv = rows
      .map((row) =>
        row
          .map((value) => {
            const stringValue = String(value ?? "");

            return `"${stringValue.replaceAll('"', '""')}"`
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;

    link.download = `BioTrack-Analytics-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading">
          <div className="analytics-spinner"></div>

          <h3>Loading Analytics</h3>

          <p>
            Calculating waste and collection insights...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <div className="analytics-page">
        <div className="analytics-error">
          <div className="analytics-error-icon">!</div>

          <h3>Unable to load analytics</h3>

          <p>{error}</p>

          <button
            type="button"
            className="analytics-primary-btn"
            onClick={loadAnalytics}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="analytics-page">

      {/* HEADER */}
      <div className="analytics-header">

        <div>
          <span className="analytics-label">
            INSIGHTS
          </span>

          <h2>Waste Analytics</h2>

          <p>
            Monitor waste generation, segregation,
            collection and AI performance.
          </p>

          {lastUpdated && (
            <span className="analytics-updated">
              Updated{" "}
              {lastUpdated.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>

        <div className="analytics-header-actions">

          <button
            type="button"
            className="analytics-secondary-btn"
            onClick={loadAnalytics}
          >
            ↻ Refresh
          </button>

          <button
            type="button"
            className="analytics-primary-btn"
            onClick={generateReport}
          >
            ↓ Export CSV
          </button>

        </div>
      </div>

      {/* TOP METRICS */}
      <div className="analytics-metric-grid">

        <div className="analytics-metric-card">
          <div className="analytics-metric-icon waste-icon">
            ♻
          </div>

          <div>
            <span>Total Waste</span>

            <strong>
              {formatNumber(metrics.totalWaste)} kg
            </strong>

            <small>
              Across {metrics.totalRecords} records
            </small>
          </div>
        </div>

        <div className="analytics-metric-card">
          <div className="analytics-metric-icon collection-icon">
            ✓
          </div>

          <div>
            <span>Collection Rate</span>

            <strong>
              {formatNumber(metrics.collectionRate, 1)}%
            </strong>

            <small>
              {metrics.completedCollections} completed
            </small>
          </div>
        </div>

        <div className="analytics-metric-card">
          <div className="analytics-metric-icon ai-icon">
            ✦
          </div>

          <div>
            <span>AI Confidence</span>

            <strong>
              {metrics.aiAccuracy > 0
                ? `${formatNumber(metrics.aiAccuracy, 1)}%`
                : "N/A"}
            </strong>

            <small>
              Based on AI-classified records
            </small>
          </div>
        </div>

        <div className="analytics-metric-card">
          <div className="analytics-metric-icon disposal-icon">
            ⌁
          </div>

          <div>
            <span>Disposed Waste</span>

            <strong>
              {formatNumber(metrics.disposedWaste)} kg
            </strong>

            <small>
              Final disposal status
            </small>
          </div>
        </div>

      </div>

      {/* BIN DISTRIBUTION */}
      <div className="analytics-grid-two">

        <section className="analytics-panel">

          <div className="analytics-panel-header">
            <div>
              <span className="analytics-mini-label">
                SEGREGATION
              </span>

              <h3>Waste by Bin</h3>
            </div>

            <span className="analytics-panel-count">
              {formatNumber(metrics.totalWaste)} kg
            </span>
          </div>

          <div className="bin-chart">

            {binAnalytics.map((item) => {
              const percentage =
                metrics.totalWaste > 0
                  ? (item.weight / metrics.totalWaste) * 100
                  : 0;

              const width =
                (item.weight / maxBinWeight) * 100;

              return (
                <div
                  className="bin-row"
                  key={item.name}
                >

                  <div className="bin-row-top">
                    <div className="bin-name">
                      <span
                        className={`bin-dot bin-${item.name.toLowerCase()}`}
                      ></span>

                      <strong>{item.name}</strong>
                    </div>

                    <div className="bin-value">
                      <strong>
                        {formatNumber(item.weight)} kg
                      </strong>

                      <span>
                        {formatNumber(percentage, 1)}%
                      </span>
                    </div>
                  </div>

                  <div className="analytics-progress">
                    <div
                      className={`analytics-progress-fill fill-${item.name.toLowerCase()}`}
                      style={{
                        width: `${width}%`,
                      }}
                    ></div>
                  </div>

                  <small>
                    {item.count} waste record
                    {item.count === 1 ? "" : "s"}
                  </small>

                </div>
              );
            })}

          </div>

        </section>

        {/* STATUS */}
        <section className="analytics-panel">

          <div className="analytics-panel-header">

            <div>
              <span className="analytics-mini-label">
                LIFECYCLE
              </span>

              <h3>Waste Status</h3>
            </div>

          </div>

          <div className="status-list">

            {statusAnalytics.map((item) => {

              const percentage =
                metrics.totalRecords > 0
                  ? (item.count /
                      metrics.totalRecords) *
                    100
                  : 0;

              return (
                <div
                  className="status-row"
                  key={item.status}
                >

                  <div className="status-row-main">

                    <span
                      className={`status-indicator status-${item.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    ></span>

                    <div>
                      <strong>{item.status}</strong>

                      <small>
                        {formatNumber(item.weight)} kg
                      </small>
                    </div>

                  </div>

                  <div className="status-row-value">
                    <strong>{item.count}</strong>

                    <span>
                      {formatNumber(
                        percentage,
                        0
                      )}%
                    </span>
                  </div>

                </div>
              );
            })}

          </div>

        </section>

      </div>

      {/* DEPARTMENT */}
      <section className="analytics-panel">

        <div className="analytics-panel-header">

          <div>
            <span className="analytics-mini-label">
              GENERATION
            </span>

            <h3>Waste by Department</h3>
          </div>

          <span className="analytics-panel-count">
            Top departments
          </span>

        </div>

        {departmentAnalytics.length === 0 ? (
          <div className="analytics-empty">
            <span>⌁</span>

            <h4>No department data</h4>

            <p>
              Department analytics will appear when
              waste records are available.
            </p>
          </div>
        ) : (
          <div className="department-list">

            {departmentAnalytics.map((item) => {

              const width =
                (item.weight /
                  maxDepartmentWeight) *
                100;

              return (
                <div
                  className="department-row"
                  key={item.department}
                >

                  <div className="department-info">

                    <div>
                      <strong>
                        {item.department}
                      </strong>

                      <small>
                        {item.count} record
                        {item.count === 1
                          ? ""
                          : "s"}
                      </small>
                    </div>

                    <strong>
                      {formatNumber(item.weight)} kg
                    </strong>

                  </div>

                  <div className="analytics-progress">
                    <div
                      className="department-progress-fill"
                      style={{
                        width: `${width}%`,
                      }}
                    ></div>
                  </div>

                </div>
              );
            })}

          </div>
        )}

      </section>

      {/* COLLECTION PERFORMANCE */}
      <section className="analytics-panel">

        <div className="analytics-panel-header">

          <div>
            <span className="analytics-mini-label">
              COLLECTION
            </span>

            <h3>Collection Performance</h3>
          </div>

          <span className="analytics-panel-count">
            {collections.length} total requests
          </span>

        </div>

        <div className="collection-performance">

          <div className="performance-circle">
            <div>
              <strong>
                {formatNumber(
                  metrics.collectionRate,
                  0
                )}%
              </strong>

              <span>Completed</span>
            </div>
          </div>

          <div className="performance-stats">

            <div>
              <span>Total Requests</span>
              <strong>{collections.length}</strong>
            </div>

            <div>
              <span>Completed</span>
              <strong>
                {metrics.completedCollections}
              </strong>
            </div>

            <div>
              <span>Collected Waste</span>
              <strong>
                {formatNumber(
                  metrics.collectedWaste
                )} kg
              </strong>
            </div>

          </div>

        </div>

      </section>

      {/* FOOTER NOTE */}
      <div className="analytics-data-note">
        <span>●</span>

        <p>
          Analytics are calculated from your
          authenticated hospital waste and collection
          records.
        </p>
      </div>

    </div>
  );
}

export default AnalyticsSection;