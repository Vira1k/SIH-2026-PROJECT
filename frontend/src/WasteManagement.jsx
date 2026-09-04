import { useEffect, useMemo, useState } from "react";
import "./WasteManagement.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://sih-2026-project-u1ga.onrender.com/api";

const binInfo = {
  Yellow: {
    icon: "🟡",
    className: "yellow",
  },
  Red: {
    icon: "🔴",
    className: "red",
  },
  White: {
    icon: "⚪",
    className: "white",
  },
  Blue: {
    icon: "🔵",
    className: "blue",
  },
};

const categories = [
  "All",
  "Sharps",
  "Soiled Waste",
  "Contaminated Plastic",
  "Glass Waste",
  "Anatomical Waste",
];

function WasteManagement() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    type: "",
    category: "Sharps",
    bin: "White",
    weight: "",
    department: "",
  });

  const token = localStorage.getItem("biotrackToken");

  const logoutBecauseUnauthorized = () => {
    localStorage.removeItem("biotrackLoggedIn");
    localStorage.removeItem("biotrackToken");
    window.location.reload();
  };

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  const loadWasteRecords = async () => {
    if (!token) {
      setIsLoading(false);
      setError("Your session has expired. Please sign in again.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/waste`, {
        method: "GET",
        headers: getHeaders(),
      });

      if (response.status === 401) {
        logoutBecauseUnauthorized();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load waste records.");
      }

      const apiRecords = Array.isArray(data.records) ? data.records : [];

      setRecords(
        apiRecords.map((record) => ({
          _id: record._id,
          id: record.wasteId,
          type: record.type,
          category: record.category,
          bin: record.bin,
          weight: Number(record.weight) || 0,
          department: record.department,
          date: record.createdAt
            ? new Date(record.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "—",
          status: record.status || "Pending",
          aiConfidence: record.aiConfidence,
          aiDetected: record.aiDetected,
        }))
      );
    } catch (err) {
      console.error("Waste records load error:", err);
      setError(
        err.message ||
          "Unable to connect to the BioTrack-AI server. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWasteRecords();
  }, []);

  const totals = useMemo(() => {
    return {
      total: records.reduce(
        (sum, item) => sum + Number(item.weight || 0),
        0
      ),

      yellow: records
        .filter((item) => item.bin === "Yellow")
        .reduce((sum, item) => sum + Number(item.weight || 0), 0),

      red: records
        .filter((item) => item.bin === "Red")
        .reduce((sum, item) => sum + Number(item.weight || 0), 0),

      white: records
        .filter((item) => item.bin === "White")
        .reduce((sum, item) => sum + Number(item.weight || 0), 0),

      blue: records
        .filter((item) => item.bin === "Blue")
        .reduce((sum, item) => sum + Number(item.weight || 0), 0),
    };
  }, [records]);

  const filteredRecords = records.filter((record) => {
    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      !searchText ||
      String(record.id || "").toLowerCase().includes(searchText) ||
      String(record.type || "").toLowerCase().includes(searchText) ||
      String(record.department || "").toLowerCase().includes(searchText);

    const matchesCategory =
      categoryFilter === "All" || record.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAddWaste = async (event) => {
    event.preventDefault();

    if (
      !formData.type.trim() ||
      !formData.weight ||
      !formData.department.trim()
    ) {
      alert("Please fill all required fields.");
      return;
    }

    if (Number(formData.weight) < 0.1) {
      alert("Weight must be at least 0.1 kg.");
      return;
    }

    if (!token) {
      alert("Your session has expired. Please sign in again.");
      logoutBecauseUnauthorized();
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch(`${API_URL}/waste`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          type: formData.type.trim(),
          category: formData.category,
          bin: formData.bin,
          weight: Number(formData.weight),
          department: formData.department.trim(),
        }),
      });

      if (response.status === 401) {
        logoutBecauseUnauthorized();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to create waste record.");
      }

      setFormData({
        type: "",
        category: "Sharps",
        bin: "White",
        weight: "",
        department: "",
      });

      setShowModal(false);

      await loadWasteRecords();

      alert("Waste record saved successfully.");
    } catch (err) {
      console.error("Add waste error:", err);

      alert(
        err.message ||
          "Unable to connect to the BioTrack-AI server. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkCollected = async (record) => {
    if (!record?._id || !token) {
      alert("Unable to update this waste record.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/waste/${record._id}/status`,
        {
          method: "PATCH",
          headers: getHeaders(),
          body: JSON.stringify({
            status: "Collected",
          }),
        }
      );

      if (response.status === 401) {
        logoutBecauseUnauthorized();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update waste status.");
      }

      await loadWasteRecords();
    } catch (err) {
      console.error("Update waste status error:", err);
      alert(err.message || "Unable to update waste status.");
    }
  };

  return (
    <div className="waste-page">
      <div className="waste-page-header">
        <div>
          <span className="waste-label">WASTE MANAGEMENT</span>

          <h2>Biomedical Waste</h2>

          <p>
            Monitor, record and manage biomedical waste generated across your
            hospital.
          </p>
        </div>

        <button
          className="add-waste-btn"
          type="button"
          onClick={() => setShowModal(true)}
        >
          <span>+</span>
          Add Waste Record
        </button>
      </div>

      {error && (
        <div
          style={{
            marginBottom: "20px",
            padding: "14px 16px",
            borderRadius: "12px",
            background: "#fff4f4",
            border: "1px solid #ffd4d4",
            color: "#a33",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <span>{error}</span>

          <button
            type="button"
            onClick={loadWasteRecords}
            style={{
              border: "none",
              borderRadius: "8px",
              padding: "8px 12px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Retry
          </button>
        </div>
      )}

      <section className="waste-stat-grid">
        <div className="waste-stat-card total">
          <div className="waste-stat-icon">♻</div>

          <div>
            <span>Total Waste</span>
            <h3>{totals.total.toFixed(1)} kg</h3>
            <small>All recorded waste</small>
          </div>
        </div>

        <div className="waste-stat-card yellow-card">
          <div className="bin-circle yellow">Y</div>

          <div>
            <span>Yellow Bin</span>
            <h3>{totals.yellow.toFixed(1)} kg</h3>
            <small>Infectious / soiled</small>
          </div>
        </div>

        <div className="waste-stat-card red-card">
          <div className="bin-circle red">R</div>

          <div>
            <span>Red Bin</span>
            <h3>{totals.red.toFixed(1)} kg</h3>
            <small>Contaminated plastic</small>
          </div>
        </div>

        <div className="waste-stat-card white-card">
          <div className="bin-circle white">W</div>

          <div>
            <span>White Bin</span>
            <h3>{totals.white.toFixed(1)} kg</h3>
            <small>Sharps waste</small>
          </div>
        </div>

        <div className="waste-stat-card blue-card">
          <div className="bin-circle blue">B</div>

          <div>
            <span>Blue Bin</span>
            <h3>{totals.blue.toFixed(1)} kg</h3>
            <small>Glass waste</small>
          </div>
        </div>
      </section>

      <section className="waste-record-panel">
        <div className="waste-toolbar">
          <div>
            <h3>Waste Records</h3>

            <p>
              {isLoading
                ? "Loading records..."
                : `${filteredRecords.length} records found`}
            </p>
          </div>

          <div className="waste-filters">
            <div className="waste-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search waste, ID or department..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="waste-table-wrapper">
          <table className="waste-table">
            <thead>
              <tr>
                <th>Waste ID</th>
                <th>Waste Type</th>
                <th>Category</th>
                <th>Bin</th>
                <th>Weight</th>
                <th>Department</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="9" className="empty-waste">
                    <div>
                      <span>⏳</span>
                      <strong>Loading waste records...</strong>
                      <p>Connecting to BioTrack-AI backend.</p>
                    </div>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="9" className="empty-waste">
                    <div>
                      <span>♻</span>
                      <strong>No waste records found</strong>

                      <p>
                        {records.length === 0
                          ? "Add your first waste record."
                          : "Try changing your search or filter."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const bin = binInfo[record.bin] || {
                    icon: "•",
                    className: "",
                  };

                  return (
                    <tr key={record._id || record.id}>
                      <td>
                        <strong className="waste-id">{record.id}</strong>
                      </td>

                      <td>
                        <strong>{record.type}</strong>
                      </td>

                      <td>
                        <span className="category-text">
                          {record.category}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`bin-badge ${bin.className}`}
                        >
                          {bin.icon} {record.bin}
                        </span>
                      </td>

                      <td>
                        <strong>{record.weight} kg</strong>
                      </td>

                      <td>{record.department}</td>

                      <td>{record.date}</td>

                      <td>
                        <span
                          className={`waste-status ${
                            record.status === "Collected"
                              ? "collected"
                              : record.status === "Disposed"
                              ? "collected"
                              : "pending"
                          }`}
                        >
                          <span></span>
                          {record.status}
                        </span>
                      </td>

                      <td>
                        {record.status === "Pending" ? (
                          <button
                            className="collect-action"
                            type="button"
                            onClick={() => handleMarkCollected(record)}
                          >
                            Mark Collected
                          </button>
                        ) : (
                          <span className="completed-action">✓ Done</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="waste-info-grid">
        <div className="waste-info-card">
          <div className="info-icon">✦</div>

          <div>
            <strong>AI Assisted Classification</strong>

            <p>
              Use AI Detect to identify waste category and recommended disposal
              bin before recording.
            </p>
          </div>
        </div>

        <div className="waste-info-card">
          <div className="info-icon">✓</div>

          <div>
            <strong>Traceable Records</strong>

            <p>
              Every waste entry receives a unique ID for future collection and
              tracking.
            </p>
          </div>
        </div>
      </section>

      {showModal && (
        <div
          className="waste-modal-overlay"
          onClick={() => !isSaving && setShowModal(false)}
        >
          <div
            className="waste-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span>NEW RECORD</span>
                <h3>Add Waste Record</h3>
              </div>

              <button
                type="button"
                onClick={() => !isSaving && setShowModal(false)}
                disabled={isSaving}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddWaste}>
              <div className="form-group">
                <label>Waste Type *</label>

                <input
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  placeholder="e.g. Used Syringe"
                  disabled={isSaving}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    disabled={isSaving}
                  >
                    {categories
                      .filter((category) => category !== "All")
                      .map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Bin *</label>

                  <select
                    name="bin"
                    value={formData.bin}
                    onChange={handleFormChange}
                    disabled={isSaving}
                  >
                    <option value="Yellow">Yellow</option>
                    <option value="Red">Red</option>
                    <option value="White">White</option>
                    <option value="Blue">Blue</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Weight (kg) *</label>

                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    name="weight"
                    value={formData.weight}
                    onChange={handleFormChange}
                    placeholder="e.g. 5.5"
                    disabled={isSaving}
                  />
                </div>

                <div className="form-group">
                  <label>Department *</label>

                  <input
                    name="department"
                    value={formData.department}
                    onChange={handleFormChange}
                    placeholder="e.g. ICU"
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-waste-btn"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Waste Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default WasteManagement;