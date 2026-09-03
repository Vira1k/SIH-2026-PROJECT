import { useEffect, useMemo, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getToken = () => localStorage.getItem("biotrackToken");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function CollectionSection() {
  const [collections, setCollections] = useState([]);
  const [wasteRecords, setWasteRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [form, setForm] = useState({
    wasteId: "",
    scheduledDate: "",
    collectorName: "",
    collectorPhone: "",
    vehicleNumber: "",
    notes: "",
  });

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Authentication required. Please login again.");
      }

      const [collectionsResponse, wasteResponse] = await Promise.all([
        fetch(`${API_URL}/collections`, {
          headers: authHeaders(),
        }),
        fetch(`${API_URL}/waste`, {
          headers: authHeaders(),
        }),
      ]);

      const collectionsData = await collectionsResponse.json().catch(() => ({}));
      const wasteData = await wasteResponse.json().catch(() => ({}));

      if (!collectionsResponse.ok) {
        throw new Error(
          collectionsData.message || "Unable to load collection records."
        );
      }

      if (!wasteResponse.ok) {
        throw new Error(
          wasteData.message || "Unable to load waste records."
        );
      }

      setCollections(Array.isArray(collectionsData.data) ? collectionsData.data : []);
      setWasteRecords(Array.isArray(wasteData.data) ? wasteData.data : []);
    } catch (err) {
      console.error("Collection load error:", err);
      setError(err.message || "Unable to load collection data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeWaste = useMemo(
    () =>
      wasteRecords.filter(
        (item) =>
          !["Disposed", "Collected", "Processing"].includes(item.status)
      ),
    [wasteRecords]
  );

  const totalCollections = collections.length;
  const scheduledCount = collections.filter(
    (item) => item.status === "Scheduled"
  ).length;
  const inTransitCount = collections.filter(
    (item) => item.status === "In Transit"
  ).length;
  const completedCount = collections.filter(
    (item) => item.status === "Completed"
  ).length;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setSuccess("");
  };

  const resetForm = () => {
    setForm({
      wasteId: "",
      scheduledDate: "",
      collectorName: "",
      collectorPhone: "",
      vehicleNumber: "",
      notes: "",
    });
  };

  const requestPickup = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.wasteId) {
      setError("Please select a waste record.");
      return;
    }

    if (!form.scheduledDate) {
      setError("Please select a collection date and time.");
      return;
    }

    if (!form.collectorName.trim()) {
      setError("Please enter the collector name.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/collections`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          wasteId: form.wasteId,
          scheduledDate: new Date(form.scheduledDate).toISOString(),
          collectorName: form.collectorName.trim(),
          collectorPhone: form.collectorPhone.trim(),
          vehicleNumber: form.vehicleNumber.trim(),
          notes: form.notes.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to schedule collection.");
      }

      setSuccess("Collection scheduled successfully.");
      resetForm();
      setShowForm(false);
      await loadData();
    } catch (err) {
      console.error("Collection create error:", err);
      setError(err.message || "Unable to schedule collection.");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (collectionId, status) => {
    setError("");
    setSuccess("");
    setUpdatingId(collectionId);

    try {
      const response = await fetch(
        `${API_URL}/collections/${collectionId}/status`,
        {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to update collection status.");
      }

      setSuccess(`Collection status updated to ${status}.`);
      await loadData();
    } catch (err) {
      console.error("Collection status error:", err);
      setError(err.message || "Unable to update collection status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteCollection = async (collectionId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this collection schedule?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setUpdatingId(collectionId);

    try {
      const response = await fetch(
        `${API_URL}/collections/${collectionId}`,
        {
          method: "DELETE",
          headers: authHeaders(),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete collection.");
      }

      setSuccess("Collection schedule deleted.");
      await loadData();
    } catch (err) {
      console.error("Collection delete error:", err);
      setError(err.message || "Unable to delete collection.");
    } finally {
      setUpdatingId(null);
    }
  };

  const getNextStatus = (status) => {
    if (status === "Scheduled") return "Collected";
    if (status === "Collected") return "In Transit";
    if (status === "In Transit") return "Completed";
    return null;
  };

  return (
    <div className="module-page">
      <div className="module-header">
        <div>
          <span className="panel-label">COLLECTION MANAGEMENT</span>
          <h2>Waste Collection</h2>
          <p>
            Schedule pickups, assign collectors, and track collection status.
          </p>
        </div>

        <button
          type="button"
          className="primary-action"
          onClick={() => {
            setShowForm((prev) => !prev);
            setError("");
            setSuccess("");
          }}
        >
          {showForm ? "× Close" : "+ Request Pickup"}
        </button>
      </div>

      {error && (
        <div className="module-message error-message" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="module-message success-message" role="status">
          {success}
        </div>
      )}

      <div className="module-summary">
        <div className="mini-stat">
          <span>▣</span>
          <div>
            <small>Total Pickups</small>
            <strong>{totalCollections}</strong>
          </div>
        </div>

        <div className="mini-stat">
          <span>◷</span>
          <div>
            <small>Scheduled</small>
            <strong>{scheduledCount}</strong>
          </div>
        </div>

        <div className="mini-stat">
          <span>→</span>
          <div>
            <small>In Transit</small>
            <strong>{inTransitCount}</strong>
          </div>
        </div>

        <div className="mini-stat">
          <span>✓</span>
          <div>
            <small>Completed</small>
            <strong>{completedCount}</strong>
          </div>
        </div>
      </div>

      {showForm && (
        <form className="filter-panel collection-form" onSubmit={requestPickup}>
          <div className="collection-form-grid">
            <label>
              Waste Record
              <select
                name="wasteId"
                value={form.wasteId}
                onChange={handleChange}
                required
              >
                <option value="">Select waste record</option>
                {activeWaste.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.wasteId} — {item.type} — {item.weight} kg — {item.bin}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Scheduled Date & Time
              <input
                type="datetime-local"
                name="scheduledDate"
                value={form.scheduledDate}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Collector Name
              <input
                type="text"
                name="collectorName"
                value={form.collectorName}
                onChange={handleChange}
                placeholder="Enter collector name"
                required
              />
            </label>

            <label>
              Collector Phone
              <input
                type="tel"
                name="collectorPhone"
                value={form.collectorPhone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
            </label>

            <label>
              Vehicle Number
              <input
                type="text"
                name="vehicleNumber"
                value={form.vehicleNumber}
                onChange={handleChange}
                placeholder="e.g. KA01AB1234"
              />
            </label>

            <label>
              Notes
              <input
                type="text"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Optional notes"
              />
            </label>
          </div>

          <div className="collection-form-actions">
            <button
              type="button"
              className="secondary-action"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
              disabled={saving}
            >
              Cancel
            </button>

            <button type="submit" className="primary-action" disabled={saving}>
              {saving ? "Scheduling..." : "Schedule Collection"}
            </button>
          </div>

          {activeWaste.length === 0 && (
            <p className="form-hint">
              No eligible waste records are available. Add a Pending waste
              record from the Waste page first.
            </p>
          )}
        </form>
      )}

      <div className="table-panel">
        <div className="table-title">
          <h3>Collection Schedule</h3>
          <span>{collections.length} records</span>
        </div>

        {loading ? (
          <div className="empty-state">Loading collection records...</div>
        ) : collections.length === 0 ? (
          <div className="empty-state">
            <strong>No collection schedules yet</strong>
            <p>
              Click <b>Request Pickup</b> to schedule collection for a waste
              record.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Collection ID</th>
                  <th>Waste</th>
                  <th>Department</th>
                  <th>Weight</th>
                  <th>Collector</th>
                  <th>Scheduled</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {collections.map((item) => {
                  const waste = item.waste || {};
                  const nextStatus = getNextStatus(item.status);

                  return (
                    <tr key={item._id}>
                      <td>
                        <strong>{item.collectionId || "—"}</strong>
                      </td>

                      <td>
                        <strong>{waste.wasteId || "—"}</strong>
                        <small className="table-subtext">
                          {waste.type || "Waste record"}
                        </small>
                      </td>

                      <td>{waste.department || "—"}</td>

                      <td>
                        {waste.weight !== undefined
                          ? `${waste.weight} kg`
                          : "—"}
                      </td>

                      <td>
                        {item.collectorName || "—"}
                        {item.vehicleNumber && (
                          <small className="table-subtext">
                            {item.vehicleNumber}
                          </small>
                        )}
                      </td>

                      <td>{formatDateTime(item.scheduledDate)}</td>

                      <td>
                        <span
                          className={`table-status ${String(
                            item.status || ""
                          )
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {item.status || "—"}
                        </span>
                      </td>

                      <td>
                        <div className="collection-actions">
                          {nextStatus && (
                            <button
                              type="button"
                              className="small-action"
                              disabled={updatingId === item._id}
                              onClick={() =>
                                updateStatus(item._id, nextStatus)
                              }
                            >
                              {updatingId === item._id
                                ? "Updating..."
                                : nextStatus}
                            </button>
                          )}

                          {item.status === "Scheduled" && (
                            <button
                              type="button"
                              className="small-danger"
                              disabled={updatingId === item._id}
                              onClick={() => deleteCollection(item._id)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="collection-info-card">
        <div>
          <strong>Collection workflow</strong>
          <p>
            Scheduled → Collected → In Transit → Completed. Completing a
            collection automatically moves the related waste toward disposal
            in the backend.
          </p>
        </div>
        <span>{formatDate(new Date())}</span>
      </div>
    </div>
  );
}

export default CollectionSection;
