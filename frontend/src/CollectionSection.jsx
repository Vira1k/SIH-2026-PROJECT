import { useEffect, useMemo, useState } from "react";
import "./CollectionSection.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const getToken = () =>
  localStorage.getItem("biotrackToken");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

function CollectionSection() {
  const [collections, setCollections] = useState([]);
  const [wasteRecords, setWasteRecords] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    wasteId: "",
    scheduledDate: "",
    collectorName: "",
    collectorPhone: "",
    vehicleNumber: "",
    notes: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const [collectionsResponse, wasteResponse] =
        await Promise.all([
          fetch(`${API_URL}/collections`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch(`${API_URL}/waste`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

      const collectionsData =
        await collectionsResponse.json();

      const wasteData =
        await wasteResponse.json();

      if (!collectionsResponse.ok) {
        throw new Error(
          collectionsData.message ||
            "Failed to load collections."
        );
      }

      if (!wasteResponse.ok) {
        throw new Error(
          wasteData.message ||
            "Failed to load waste records."
        );
      }

        const collectionList = Array.isArray(collectionsData.collections)
          ? collectionsData.collections
          : Array.isArray(collectionsData.data)
          ? collectionsData.data
          : Array.isArray(collectionsData.records)
          ? collectionsData.records
          : [];

      const wasteList = Array.isArray(wasteData.data)
        ? wasteData.data
        : Array.isArray(wasteData.records)
        ? wasteData.records
        : [];

      setCollections(collectionList);
      setWasteRecords(wasteList);
    } catch (err) {
      setError(
        err.message ||
          "Unable to load collection data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const eligibleWaste = useMemo(() => {
    return wasteRecords.filter((item) => {
      const status = String(item.status || "")
        .trim()
        .toLowerCase();

      return status === "pending";
    });
  }, [wasteRecords]);

  const stats = useMemo(() => {
    const completed = collections.filter(
      (item) =>
        item.status === "Completed"
    ).length;

    const scheduled = collections.filter(
      (item) =>
        item.status === "Scheduled"
    ).length;

    const inTransit = collections.filter(
      (item) =>
        item.status === "In Transit"
    ).length;

    return {
      total: collections.length,
      scheduled,
      inTransit,
      completed,
    };
  }, [collections]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.wasteId) {
      setError(
        "Please select a waste record."
      );
      return;
    }

    if (!form.scheduledDate) {
      setError(
        "Please select collection date and time."
      );
      return;
    }

    if (!form.collectorName.trim()) {
      setError(
        "Please enter collector name."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/collections`,
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            wasteId: form.wasteId,
            scheduledDate: new Date(
              form.scheduledDate
            ).toISOString(),
            collectorName:
              form.collectorName.trim(),
            collectorPhone:
              form.collectorPhone.trim(),
            vehicleNumber:
              form.vehicleNumber.trim(),
            notes: form.notes.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to schedule collection."
        );
      }

      setSuccess(
        "Collection scheduled successfully."
      );

      setForm({
        wasteId: "",
        scheduledDate: "",
        collectorName: "",
        collectorPhone: "",
        vehicleNumber: "",
        notes: "",
      });

      setShowForm(false);

      await loadData();
    } catch (err) {
      setError(
        err.message ||
          "Unable to schedule collection."
      );
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (
    collectionId,
    status
  ) => {
    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/collections/${collectionId}/status`,
        {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update collection status."
        );
      }

      setSuccess(
        `Collection marked as ${status}.`
      );

      await loadData();
    } catch (err) {
      setError(
        err.message ||
          "Unable to update collection status."
      );
    }
  };

  const deleteCollection = async (
    collectionId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this collection?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/collections/${collectionId}`,
        {
          method: "DELETE",
          headers: authHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to cancel collection."
        );
      }

      setSuccess(
        "Collection cancelled successfully."
      );

      await loadData();
    } catch (err) {
      setError(
        err.message ||
          "Unable to cancel collection."
      );
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "—";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getWaste = (collection) => {
    if (!collection?.waste) {
      return null;
    }

    return collection.waste;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Completed":
        return "completed";

      case "In Transit":
        return "in-transit";

      case "Collected":
        return "collected";

      case "Cancelled":
        return "cancelled";

      case "Scheduled":
      default:
        return "scheduled";
    }
  };

  return (
    <div className="collection-module">

      {/* HEADER */}

      <div className="collection-page-header">

        <div>
          <span className="collection-eyebrow">
            COLLECTION MANAGEMENT
          </span>

          <h2>
            Waste Collection
          </h2>

          <p>
            Schedule pickups, assign collectors,
            and track collection status.
          </p>
        </div>

        <button
          type="button"
          className="collection-primary-btn"
          onClick={async () => {
            const nextShowForm = !showForm;
            setShowForm(nextShowForm);
            setError("");
            setSuccess("");

            if (nextShowForm) {
              await loadData();
            }
          }}
        >
          {showForm
            ? "× Close Form"
            : "+ Request Pickup"}
        </button>

      </div>


      {/* MESSAGES */}

      {error && (
        <div className="collection-message collection-error">
          <span>!</span>
          <div>{error}</div>
        </div>
      )}

      {success && (
        <div className="collection-message collection-success">
          <span>✓</span>
          <div>{success}</div>
        </div>
      )}


      {/* FORM */}

      {showForm && (
        <form
          className="collection-form-card"
          onSubmit={handleSubmit}
        >

          <div className="collection-form-header">

            <div>
              <span className="collection-form-label">
                NEW REQUEST
              </span>

              <h3>
                Schedule Collection
              </h3>

              <p>
                Select a pending waste record and
                assign the collection details.
              </p>
            </div>

          </div>


          <div className="collection-form-grid">

            {/* WASTE */}

            <label className="collection-field">

              <span>
                Waste Record
                <b>*</b>
              </span>

              <select
                name="wasteId"
                value={form.wasteId}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select waste record
                </option>

                {eligibleWaste.length === 0 ? (
                  <option disabled>
                    No eligible waste records
                  </option>
                ) : (
                  eligibleWaste.map((item) => (
                    <option
                      key={item._id}
                      value={item._id}
                    >
                      {item.wasteId} —{" "}
                      {item.type} —{" "}
                      {item.weight} kg —{" "}
                      {item.department}
                    </option>
                  ))
                )}

              </select>

              <small>
                Only pending waste records are
                available for scheduling.
              </small>

            </label>


            {/* DATE */}

            <label className="collection-field">

              <span>
                Collection Date & Time
                <b>*</b>
              </span>

              <input
                type="datetime-local"
                name="scheduledDate"
                value={form.scheduledDate}
                onChange={handleChange}
                required
              />

            </label>


            {/* COLLECTOR */}

            <label className="collection-field">

              <span>
                Collector Name
                <b>*</b>
              </span>

              <input
                type="text"
                name="collectorName"
                placeholder="Enter collector name"
                value={form.collectorName}
                onChange={handleChange}
                required
              />

            </label>


            {/* PHONE */}

            <label className="collection-field">

              <span>
                Collector Phone
              </span>

              <input
                type="tel"
                name="collectorPhone"
                placeholder="Enter phone number"
                value={form.collectorPhone}
                onChange={handleChange}
              />

            </label>


            {/* VEHICLE */}

            <label className="collection-field">

              <span>
                Vehicle Number
              </span>

              <input
                type="text"
                name="vehicleNumber"
                placeholder="Example: KA 01 AB 1234"
                value={form.vehicleNumber}
                onChange={handleChange}
              />

            </label>


            {/* NOTES */}

            <label className="collection-field collection-field-full">

              <span>
                Notes
              </span>

              <textarea
                name="notes"
                placeholder="Additional collection instructions..."
                value={form.notes}
                onChange={handleChange}
                rows="4"
              />

            </label>

          </div>


          <div className="collection-form-actions">

            <button
              type="button"
              className="collection-secondary-btn"
              onClick={() => {
                setShowForm(false);
                setError("");
                setSuccess("");
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="collection-primary-btn"
              disabled={saving}
            >
              {saving
                ? "Scheduling..."
                : "Schedule Collection"}
            </button>

          </div>

        </form>
      )}


      {/* LOADING */}

      {loading ? (

        <div className="collection-loading-card">
          <div className="collection-spinner"></div>

          <h3>
            Loading collection data...
          </h3>

          <p>
            Please wait while we fetch your
            hospital records.
          </p>
        </div>

      ) : (

        <>

          {/* STATS */}

          <div className="collection-stats">

            <div className="collection-stat-card">
              <div className="collection-stat-icon total">
                ▣
              </div>

              <div>
                <span>
                  Total Pickups
                </span>

                <strong>
                  {stats.total}
                </strong>
              </div>
            </div>


            <div className="collection-stat-card">
              <div className="collection-stat-icon scheduled">
                ◷
              </div>

              <div>
                <span>
                  Scheduled
                </span>

                <strong>
                  {stats.scheduled}
                </strong>
              </div>
            </div>


            <div className="collection-stat-card">
              <div className="collection-stat-icon transit">
                →
              </div>

              <div>
                <span>
                  In Transit
                </span>

                <strong>
                  {stats.inTransit}
                </strong>
              </div>
            </div>


            <div className="collection-stat-card">
              <div className="collection-stat-icon completed">
                ✓
              </div>

              <div>
                <span>
                  Completed
                </span>

                <strong>
                  {stats.completed}
                </strong>
              </div>
            </div>

          </div>


          {/* COLLECTION LIST */}

          <section className="collection-list-card">

            <div className="collection-list-header">

              <div>
                <span className="collection-eyebrow">
                  COLLECTION SCHEDULE
                </span>

                <h3>
                  Scheduled Pickups
                </h3>

                <p>
                  Manage your hospital's active
                  collection operations.
                </p>
              </div>

              <span className="collection-record-count">
                {collections.length}{" "}
                {collections.length === 1
                  ? "record"
                  : "records"}
              </span>

            </div>


            {collections.length === 0 ? (

              <div className="collection-empty">

                <div className="collection-empty-icon">
                  ▣
                </div>

                <h3>
                  No collection schedules yet
                </h3>

                <p>
                  Click{" "}
                  <strong>
                    Request Pickup
                  </strong>{" "}
                  to schedule collection for a
                  waste record.
                </p>

                <button
                  type="button"
                  className="collection-primary-btn"
                  onClick={async () => {
                    setShowForm(true);
                    setError("");
                    setSuccess("");
                    await loadData();
                  }}
                >
                  + Request Pickup
                </button>

              </div>

            ) : (

              <div className="collection-table-wrapper">

                <table className="collection-table">

                  <thead>
                    <tr>
                      <th>Collection</th>
                      <th>Waste</th>
                      <th>Schedule</th>
                      <th>Collector</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>

                    {collections.map(
                      (collection) => {

                        const waste =
                          getWaste(
                            collection
                          );

                        return (
                          <tr
                            key={
                              collection._id
                            }
                          >

                            {/* COLLECTION ID */}

                            <td>
                              <div className="collection-id">
                                {collection.collectionId ||
                                  "—"}
                              </div>

                              <div className="collection-subtext">
                                Created{" "}
                                {formatDate(
                                  collection.createdAt
                                )}
                              </div>
                            </td>


                            {/* WASTE */}

                            <td>

                              <div className="collection-waste-name">
                                {waste?.type ||
                                  "Biomedical Waste"}
                              </div>

                              <div className="collection-subtext">

                                {waste?.wasteId ||
                                  "—"}

                                {waste?.bin && (
                                  <>
                                    {" • "}
                                    {waste.bin}
                                  </>
                                )}

                              </div>

                            </td>


                            {/* SCHEDULE */}

                            <td>

                              <div className="collection-date">
                                {formatDate(
                                  collection.scheduledDate
                                )}
                              </div>

                            </td>


                            {/* COLLECTOR */}

                            <td>

                              <div className="collection-waste-name">
                                {collection.collectorName ||
                                  "—"}
                              </div>

                              <div className="collection-subtext">

                                {collection.collectorPhone ||
                                  "No phone"}

                                {collection.vehicleNumber && (
                                  <>
                                    {" • "}
                                    {
                                      collection.vehicleNumber
                                    }
                                  </>
                                )}

                              </div>

                            </td>


                            {/* STATUS */}

                            <td>

                              <span
                                className={`collection-status ${getStatusClass(
                                  collection.status
                                )}`}
                              >
                                <span></span>

                                {
                                  collection.status
                                }
                              </span>

                            </td>


                            {/* ACTIONS */}

                            <td>

                              <div className="collection-actions">

                                {collection.status ===
                                  "Scheduled" && (
                                  <button
                                    type="button"
                                    className="collection-action-btn blue"
                                    onClick={() =>
                                      updateStatus(
                                        collection._id,
                                        "Collected"
                                      )
                                    }
                                  >
                                    Mark Collected
                                  </button>
                                )}


                                {collection.status ===
                                  "Collected" && (
                                  <button
                                    type="button"
                                    className="collection-action-btn blue"
                                    onClick={() =>
                                      updateStatus(
                                        collection._id,
                                        "In Transit"
                                      )
                                    }
                                  >
                                    In Transit
                                  </button>
                                )}


                                {collection.status ===
                                  "In Transit" && (
                                  <button
                                    type="button"
                                    className="collection-action-btn green"
                                    onClick={() =>
                                      updateStatus(
                                        collection._id,
                                        "Completed"
                                      )
                                    }
                                  >
                                    Complete
                                  </button>
                                )}


                                {[
                                  "Scheduled",
                                  "Collected",
                                  "In Transit",
                                ].includes(
                                  collection.status
                                ) && (
                                  <button
                                    type="button"
                                    className="collection-action-btn danger"
                                    onClick={() =>
                                      deleteCollection(
                                        collection._id
                                      )
                                    }
                                  >
                                    Cancel
                                  </button>
                                )}

                              </div>

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </section>


          {/* WORKFLOW */}

          <div className="collection-workflow">

            <div className="collection-workflow-icon">
              ✓
            </div>

            <div>

              <strong>
                Collection workflow
              </strong>

              <p>
                Scheduled → Collected → In Transit
                → Completed. Completing a collection
                automatically moves the related waste
                toward disposal in the backend.
              </p>

            </div>

          </div>

        </>

      )}

    </div>
  );
}

export default CollectionSection;