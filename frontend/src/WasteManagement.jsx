import { useMemo, useState } from "react";
import "./WasteManagement.css";

const initialWasteRecords = [
  {
    id: "BW-1001",
    type: "Used Syringe",
    category: "Sharps",
    bin: "White",
    weight: 12.5,
    department: "Emergency",
    date: "02 Sep 2026",
    status: "Pending",
  },
  {
    id: "BW-1002",
    type: "Blood-Soaked Dressing",
    category: "Soiled Waste",
    bin: "Yellow",
    weight: 18.2,
    department: "Ward A",
    date: "02 Sep 2026",
    status: "Collected",
  },
  {
    id: "BW-1003",
    type: "Used IV Tube",
    category: "Contaminated Plastic",
    bin: "Red",
    weight: 9.8,
    department: "ICU",
    date: "02 Sep 2026",
    status: "Pending",
  },
  {
    id: "BW-1004",
    type: "Medicine Vial",
    category: "Glass Waste",
    bin: "Blue",
    weight: 6.4,
    department: "Pharmacy",
    date: "01 Sep 2026",
    status: "Collected",
  },
  {
    id: "BW-1005",
    type: "Human Anatomical Waste",
    category: "Anatomical Waste",
    bin: "Yellow",
    weight: 21.6,
    department: "Operation Theatre",
    date: "01 Sep 2026",
    status: "Collected",
  },
  {
    id: "BW-1006",
    type: "Plastic Gloves",
    category: "Contaminated Plastic",
    bin: "Red",
    weight: 14.3,
    department: "Laboratory",
    date: "31 Aug 2026",
    status: "Pending",
  },
];

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
  const [records, setRecords] = useState(initialWasteRecords);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);

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

  const totals = useMemo(() => {
    return {
      total: records.reduce((sum, item) => sum + Number(item.weight), 0),
      yellow: records
        .filter((item) => item.bin === "Yellow")
        .reduce((sum, item) => sum + Number(item.weight), 0),
      red: records
        .filter((item) => item.bin === "Red")
        .reduce((sum, item) => sum + Number(item.weight), 0),
      white: records
        .filter((item) => item.bin === "White")
        .reduce((sum, item) => sum + Number(item.weight), 0),
      blue: records
        .filter((item) => item.bin === "Blue")
        .reduce((sum, item) => sum + Number(item.weight), 0),
    };
  }, [records]);

  const filteredRecords = records.filter((record) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      record.id.toLowerCase().includes(searchText) ||
      record.type.toLowerCase().includes(searchText) ||
      record.department.toLowerCase().includes(searchText);

    const matchesCategory =
      categoryFilter === "All" ||
      record.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAddWaste = (event) => {
    event.preventDefault();

    if (
      !formData.type ||
      !formData.weight ||
      !formData.department
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const newRecord = {
      id: `BW-${1000 + records.length + 1}`,
      type: formData.type,
      category: formData.category,
      bin: formData.bin,
      weight: Number(formData.weight),
      department: formData.department,
      date: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      status: "Pending",
    };

    setRecords((previous) => [newRecord, ...previous]);

    setFormData({
      type: "",
      category: "Sharps",
      bin: "White",
      weight: "",
      department: "",
    });

    setShowModal(false);
  };

  const handleMarkCollected = (id) => {
    setRecords((previous) =>
      previous.map((record) =>
        record.id === id
          ? { ...record, status: "Collected" }
          : record
      )
    );
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
              {filteredRecords.length} records found
            </p>
          </div>

          <div className="waste-filters">

            <div className="waste-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search waste, ID or department..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

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

        {/* TABLE */}
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

              {filteredRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="empty-waste"
                  >
                    <div>
                      <span>♻</span>
                      <strong>No waste records found</strong>
                      <p>
                        Try changing your search or filter.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {

                  const bin = binInfo[record.bin];

                  return (
                    <tr key={record.id}>

                      <td>
                        <strong className="waste-id">
                          {record.id}
                        </strong>
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
                        <strong>
                          {record.weight} kg
                        </strong>
                      </td>

                      <td>
                        {record.department}
                      </td>

                      <td>
                        {record.date}
                      </td>

                      <td>
                        <span
                          className={`waste-status ${
                            record.status === "Collected"
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
                            onClick={() =>
                              handleMarkCollected(record.id)
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
            <strong>AI Assisted Classification</strong>
            <p>
              Use AI Detect to identify waste category
              and recommended disposal bin before recording.
            </p>
          </div>
        </div>

        <div className="waste-info-card">
          <div className="info-icon">✓</div>

          <div>
            <strong>Traceable Records</strong>
            <p>
              Every waste entry receives a unique ID for
              future collection and tracking.
            </p>
          </div>
        </div>

      </section>

      {/* ADD WASTE MODAL */}
      {showModal && (
        <div
          className="waste-modal-overlay"
          onClick={() => setShowModal(false)}
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
                onClick={() => setShowModal(false)}
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
                />
              </div>

              <div className="form-row">

                <div className="form-group">
                  <label>Category *</label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                  >
                    {categories
                      .filter(
                        (category) => category !== "All"
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
                  <label>Bin *</label>

                  <select
                    name="bin"
                    value={formData.bin}
                    onChange={handleFormChange}
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
                  />
                </div>

                <div className="form-group">
                  <label>Department *</label>

                  <input
                    name="department"
                    value={formData.department}
                    onChange={handleFormChange}
                    placeholder="e.g. ICU"
                  />
                </div>

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-waste-btn"
                >
                  Save Waste Record
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