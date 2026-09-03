import { useEffect, useMemo, useState } from "react";
import "./WasteManagement.css";

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

function WasteManagement() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    type: "",
    category: "Sharps",
    bin: "White",
    weight: "",
    department: "",
  });

  const categories = [
    "All",
    "Sharps",
    "Soiled Waste",
    "Contaminated Plastic",
    "Glass Waste",
    "Anatomical Waste",
  ];

  // =========================================
  // FETCH WASTE RECORDS FROM BACKEND
  // =========================================

  const fetchWasteRecords = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("biotrackToken");

      if (!token) {
        alert("Authentication token not found. Please login again.");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/waste",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message || "Unable to fetch waste records."
        );
        return;
      }

      setRecords(data.records || []);
    } catch (error) {
      console.error("Fetch waste records error:", error);

      alert(
        "Unable to connect to the BioTrack-AI server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // Load records when page opens
  useEffect(() => {
    fetchWasteRecords();
  }, []);

  // =========================================
  // CALCULATE TOTALS
  // =========================================

  const totals = useMemo(() => {
    return {
      total: records.reduce(
        (sum, item) => sum + Number(item.weight || 0),
        0
      ),

      yellow: records
        .filter((item) => item.bin === "Yellow")
        .reduce(
          (sum, item) => sum + Number(item.weight || 0),
          0
        ),

      red: records
        .filter((item) => item.bin === "Red")
        .reduce(
          (sum, item) => sum + Number(item.weight || 0),
          0
        ),

      white: records
        .filter((item) => item.bin === "White")
        .reduce(
          (sum, item) => sum + Number(item.weight || 0),
          0
        ),

      blue: records
        .filter((item) => item.bin === "Blue")
        .reduce(
          (sum, item) => sum + Number(item.weight || 0),
          0
        ),
    };
  }, [records]);

  // =========================================
  // SEARCH + CATEGORY FILTER
  // =========================================

  const filteredRecords = records.filter((record) => {
    const searchText = search.toLowerCase();

    const recordId = (
      record.wasteId ||
      record.id ||
      ""
    ).toLowerCase();

    const type = (
      record.type ||
      ""
    ).toLowerCase();

    const department = (
      record.department ||
      ""
    ).toLowerCase();

    const matchesSearch =
      recordId.includes(searchText) ||
      type.includes(searchText) ||
      department.includes(searchText);

    const matchesCategory =
      categoryFilter === "All" ||
      record.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // =========================================
  // FORM CHANGE
  // =========================================

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================
  // CREATE WASTE RECORD
  // =========================================

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

    try {
      setSaving(true);

      const token = localStorage.getItem("biotrackToken");

      if (!token) {
        alert("Authentication token not found. Please login again.");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/waste",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type: formData.type.trim(),
            category: formData.category,
            bin: formData.bin,
            weight: Number(formData.weight),
            department: formData.department.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message || "Unable to create waste record."
        );
        return;
      }

      // Add newly created MongoDB record to UI
      if (data.record) {
        setRecords((previous) => [
          data.record,
          ...previous,
        ]);
      }

      setFormData({
        type: "",
        category: "Sharps",
        bin: "White",
        weight: "",
        department: "",
      });

      setShowModal(false);

      alert("Waste record saved successfully.");
    } catch (error) {
      console.error("Create waste record error:", error);

      alert(
        "Unable to connect to the BioTrack-AI server."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================
  // MARK WASTE COLLECTED
  // =========================================

  const handleMarkCollected = async (id) => {
    try {
      const token = localStorage.getItem("biotrackToken");

      if (!token) {
        alert("Authentication token not found. Please login again.");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/waste/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "Collected",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message || "Unable to update waste status."
        );
        return;
      }

      if (data.record) {
        setRecords((previous) =>
          previous.map((record) =>
            record._id === id
              ? data.record
              : record
          )
        );
      }
    } catch (error) {
      console.error(
        "Update waste status error:",
        error
      );

      alert(
        "Unable to connect to the BioTrack-AI server."
      );
    }
  };

  return (
    <div className="waste-page">

      {/* PAGE HEADER */}
      <div className="waste-page-header">
        <div>
          <span className="waste-label">
            WASTE MANAGEMENT
          </span>

          <h2>Biomedical Waste</h2>

          <p>
            Monitor, record and manage biomedical waste
            generated across your hospital.
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

      {/* STAT CARDS */}
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

      {/* RECORDS PANEL */}
      <section className="waste-record-panel">

        <div className="waste-toolbar">

          <div>
            <h3>Waste Records</h3>

            <p>
              {loading
                ? "Loading records..."
                : `${filteredRecords.length} record${
                    filteredRecords.length !== 1
                      ? "s"
                      : ""
                  } found`}
            </p>
          </div>

          <div className="waste-filters">

            <input
              className="waste-search"
              type="text"
              placeholder="Search waste ID, type or department..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
            >
              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
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

              {loading ? (
                <tr>
                  <td
                    colSpan="9"
                    className="empty-waste"
                  >
                    <div>
                      <span>⏳</span>
                      <strong>
                        Loading waste records...
                      </strong>
                      <p>
                        Fetching data from MongoDB.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="empty-waste"
                  >
                    <div>
                      <span>♻</span>
                      <strong>
                        No waste records found
                      </strong>
                      <p>
                        Try changing your search or
                        filter, or add a new record.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {

                  const bin = binInfo[record.bin];

                  const recordId =
                    record.wasteId || record.id;

                  const formattedDate =
                    record.createdAt
                      ? new Date(
                          record.createdAt
                        ).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "-";

                  return (
                    <tr key={record._id || recordId}>

                      <td>
                        <strong className="waste-id">
                          {recordId}
                        </strong>
                      </td>

                      <td>
                        <strong>
                          {record.type}
                        </strong>
                      </td>

                      <td>
                        <span className="category-text">
                          {record.category}
                        </span>
                      </td>

                      <td>
                        {bin ? (
                          <span
                            className={`bin-badge ${bin.className}`}
                          >
                            {bin.icon} {record.bin}
                          </span>
                        ) : (
                          <span>
                            {record.bin}
                          </span>
                        )}
                      </td>

                      <td>
                        <strong>
                          {Number(record.weight).toFixed(1)} kg
                        </strong>
                      </td>

                      <td>
                        {record.department}
                      </td>

                      <td>
                        {formattedDate}
                      </td>

                      <td>
                        <span
                          className={`waste-status ${
                            record.status ===
                            "Collected"
                              ? "collected"
                              : "pending"
                          }`}
                        >
                          <span></span>
                          {record.status}
                        </span>
                      </td>

                      <td>
                        {record.status ===
                        "Pending" ? (
                          <button
                            className="collect-action"
                            type="button"
                            onClick={() =>
                              handleMarkCollected(
                                record._id
                              )
                            }
                          >
                            Mark Collected
                          </button>
                        ) : (
                          <span className="completed-action">
                            ✓ Done
                          </span>
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

      {/* INFO CARDS */}
      <section className="waste-info-grid">

        <div className="waste-info-card">
          <div className="info-icon">✦</div>

          <div>
            <strong>
              AI Assisted Classification
            </strong>

            <p>
              Use AI Detect to identify waste category
              and recommended disposal bin before
              recording.
            </p>
          </div>
        </div>

        <div className="waste-info-card">
          <div className="info-icon">✓</div>

          <div>
            <strong>
              Traceable Records
            </strong>

            <p>
              Every waste entry receives a unique ID
              for future collection and tracking.
            </p>
          </div>
        </div>

      </section>

      {/* ADD WASTE MODAL */}
      {showModal && (
        <div
          className="waste-modal-overlay"
          onClick={() =>
            !saving && setShowModal(false)
          }
        >

          <div
            className="waste-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>
                <span>NEW RECORD</span>
                <h3>Add Waste Record</h3>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  setShowModal(false)
                }
              >
                ×
              </button>

            </div>

            <form onSubmit={handleAddWaste}>

              <div className="form-group">

                <label>
                  Waste Type *
                </label>

                <input
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  placeholder="e.g. Used Syringe"
                  disabled={saving}
                />

              </div>

              <div className="form-row">

                <div className="form-group">

                  <label>
                    Category *
                  </label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    disabled={saving}
                  >
                    {categories
                      .filter(
                        (category) =>
                          category !== "All"
                      )
                      .map((category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>
                      ))}
                  </select>

                </div>

                <div className="form-group">

                  <label>
                    Bin *
                  </label>

                  <select
                    name="bin"
                    value={formData.bin}
                    onChange={handleFormChange}
                    disabled={saving}
                  >
                    <option value="Yellow">
                      Yellow
                    </option>

                    <option value="Red">
                      Red
                    </option>

                    <option value="White">
                      White
                    </option>

                    <option value="Blue">
                      Blue
                    </option>
                  </select>

                </div>

              </div>

              <div className="form-row">

                <div className="form-group">

                  <label>
                    Weight (kg) *
                  </label>

                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    name="weight"
                    value={formData.weight}
                    onChange={handleFormChange}
                    placeholder="e.g. 5.5"
                    disabled={saving}
                  />

                </div>

                <div className="form-group">

                  <label>
                    Department *
                  </label>

                  <input
                    name="department"
                    value={formData.department}
                    onChange={handleFormChange}
                    placeholder="e.g. ICU"
                    disabled={saving}
                  />

                </div>

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  disabled={saving}
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-waste-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Waste Record"}
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