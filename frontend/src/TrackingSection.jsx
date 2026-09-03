import { useEffect, useMemo, useState } from "react";
import "./TrackingSection.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const getToken = () => localStorage.getItem("biotrackToken");

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const normalize = (value) =>
  String(value || "").trim().toLowerCase();

function TrackingSection() {
  const [collections, setCollections] = useState([]);
  const [wasteRecords, setWasteRecords] = useState([]);

  const [trackingId, setTrackingId] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

      const collectionsData = await collectionsResponse.json();
      const wasteData = await wasteResponse.json();

      if (!collectionsResponse.ok) {
        throw new Error(
          collectionsData.message ||
            "Failed to load collection records."
        );
      }

      if (!wasteResponse.ok) {
        throw new Error(
          wasteData.message ||
            "Failed to load waste records."
        );
      }

      const collectionList = Array.isArray(
        collectionsData.collections
      )
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

      // Keep the currently tracked record synchronized after a status update.
      if (trackingId.trim()) {
        findRecord(
          trackingId.trim(),
          collectionList,
          wasteList,
          false
        );
      }
    } catch (err) {
      setError(
        err.message || "Unable to load tracking data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trackedCollection = selectedRecord?.collection || null;
  const trackedWaste = selectedRecord?.waste || null;

  const allTrackableRecords = useMemo(() => {
    const records = [];

    collections.forEach((collection) => {
      if (!collection?.waste) return;

      records.push({
        collection,
        waste:
          typeof collection.waste === "object"
            ? collection.waste
            : wasteRecords.find(
                (item) =>
                  item._id === collection.waste
              ),
      });
    });

    return records;
  }, [collections, wasteRecords]);

  const findRecord = (
    value,
    collectionList = collections,
    wasteList = wasteRecords,
    showMessages = true
  ) => {
    const query = normalize(value);

    if (!query) {
      setSelectedRecord(null);
      if (showMessages) {
        setError("Enter a Waste ID or Collection ID.");
      }
      return;
    }

    const collectionMatch = collectionList.find(
      (collection) =>
        normalize(collection.collectionId) === query ||
        normalize(collection._id) === query
    );

    if (collectionMatch) {
      const waste =
        typeof collectionMatch.waste === "object"
          ? collectionMatch.waste
          : wasteList.find(
              (item) =>
                item._id === collectionMatch.waste
            );

      setSelectedRecord({
        collection: collectionMatch,
        waste: waste || null,
      });

      if (showMessages) {
        setError("");
        setSuccess("");
      }

      return;
    }

    const wasteMatch = wasteList.find(
      (waste) =>
        normalize(waste.wasteId) === query ||
        normalize(waste._id) === query
    );

    if (wasteMatch) {
      const collection = collectionList.find(
        (item) => {
          const linkedWaste =
            typeof item.waste === "object"
              ? item.waste?._id
              : item.waste;

          return linkedWaste === wasteMatch._id;
        }
      );

      setSelectedRecord({
        collection: collection || null,
        waste: wasteMatch,
      });

      if (showMessages) {
        setError("");
        setSuccess("");
      }

      return;
    }

    setSelectedRecord(null);

    if (showMessages) {
      setError(
        `No waste or collection record found for "${value}".`
      );
      setSuccess("");
    }
  };

  const handleTrack = async (event) => {
    event?.preventDefault();

    setTracking(true);
    setError("");
    setSuccess("");

    // Always use the latest database state before tracking.
    try {
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

      const collectionsData = await collectionsResponse.json();
      const wasteData = await wasteResponse.json();

      if (!collectionsResponse.ok) {
        throw new Error(
          collectionsData.message ||
            "Failed to load collection records."
        );
      }

      if (!wasteResponse.ok) {
        throw new Error(
          wasteData.message ||
            "Failed to load waste records."
        );
      }

      const collectionList = Array.isArray(
        collectionsData.collections
      )
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

      findRecord(
        trackingId,
        collectionList,
        wasteList,
        true
      );
    } catch (err) {
      setSelectedRecord(null);
      setError(
        err.message || "Unable to track this record."
      );
    } finally {
      setTracking(false);
    }
  };

  const updateCollectionStatus = async (nextStatus) => {
    if (!trackedCollection?._id) {
      setError(
        "This waste does not have a collection schedule yet."
      );
      return;
    }

    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/collections/${trackedCollection._id}/status`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            status: nextStatus,
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
        `Collection status updated to ${nextStatus}.`
      );

      await loadData();
    } catch (err) {
      setError(
        err.message ||
          "Unable to update collection status."
      );
    } finally {
      setUpdating(false);
    }
  };

  const collectionStatus =
    trackedCollection?.status || null;

  const timeline = [
    {
      key: "recorded",
      title: "Waste Recorded",
      description:
        "Waste was registered in the hospital waste management system.",
      active: Boolean(trackedWaste),
      meta: trackedWaste?.createdAt
        ? new Date(
            trackedWaste.createdAt
          ).toLocaleString()
        : "Recorded",
    },
    {
      key: "scheduled",
      title: "Collection Scheduled",
      description: trackedCollection
        ? `Pickup assigned to ${trackedCollection.collectorName || "collector"}.`
        : "Waiting for a collection request.",
      active: Boolean(trackedCollection),
      meta: trackedCollection?.scheduledDate
        ? new Date(
            trackedCollection.scheduledDate
          ).toLocaleString()
        : "Pending",
    },
    {
      key: "collected",
      title: "Waste Collected",
      description:
        "The assigned collector has collected the waste.",
      active: ["Collected", "In Transit", "Completed"].includes(
        collectionStatus
      ),
      meta:
        trackedCollection?.collectedAt
          ? new Date(
              trackedCollection.collectedAt
            ).toLocaleString()
          : collectionStatus === "Collected" ||
            collectionStatus === "In Transit" ||
            collectionStatus === "Completed"
          ? "Completed"
          : "Pending",
    },
    {
      key: "transit",
      title: "In Transit",
      description:
        "Waste is being transported to the treatment/disposal facility.",
      active: ["In Transit", "Completed"].includes(
        collectionStatus
      ),
      meta:
        collectionStatus === "In Transit" ||
        collectionStatus === "Completed"
          ? "Active / Completed"
          : "Pending",
    },
    {
      key: "disposed",
      title: "Treatment / Disposal",
      description:
        "Collection workflow has been completed and the waste is ready for final disposal processing.",
      active:
        collectionStatus === "Completed" ||
        normalize(trackedWaste?.status) === "disposed",
      meta:
        trackedCollection?.completedAt
          ? new Date(
              trackedCollection.completedAt
            ).toLocaleString()
          : collectionStatus === "Completed"
          ? "Completed"
          : "Pending",
    },
  ];

  const statusClass = (status) => {
    switch (status) {
      case "Scheduled":
        return "scheduled";
      case "Collected":
        return "collected";
      case "In Transit":
        return "transit";
      case "Completed":
        return "completed";
      case "Cancelled":
        return "cancelled";
      default:
        return "pending";
    }
  };

  return (
    <div className="tracking-page">
      <div className="tracking-page-header">
        <div>
          <span className="tracking-eyebrow">
            TRACEABILITY
          </span>
          <h2>Waste Tracking</h2>
          <p>
            Track biomedical waste from generation to
            collection, transport, and final disposal.
          </p>
        </div>

        <div className="tracking-live-badge">
          <span className="tracking-live-dot"></span>
          Live Records
        </div>
      </div>

      <section className="tracking-search-card">
        <div className="tracking-search-copy">
          <span>TRACK A RECORD</span>
          <h3>Find Waste Journey</h3>
          <p>
            Enter a Waste ID such as BW-1005 or a
            Collection ID such as COL-1001.
          </p>
        </div>

        <form
          className="tracking-search-form"
          onSubmit={handleTrack}
        >
          <input
            value={trackingId}
            onChange={(event) => {
              setTrackingId(event.target.value);
              setError("");
              setSuccess("");
            }}
            placeholder="Enter Waste ID or Collection ID"
            aria-label="Waste ID or Collection ID"
          />

          <button
            type="submit"
            disabled={tracking}
          >
            {tracking ? "Tracking..." : "Track Waste"}
          </button>
        </form>
      </section>

      {error && (
        <div className="tracking-alert error">
          <span>!</span>
          {error}
        </div>
      )}

      {success && (
        <div className="tracking-alert success">
          <span>✓</span>
          {success}
        </div>
      )}

      {loading ? (
        <section className="tracking-loading-card">
          <div className="tracking-spinner"></div>
          <h3>Loading tracking data...</h3>
          <p>
            Fetching your hospital's latest waste and
            collection records.
          </p>
        </section>
      ) : selectedRecord ? (
        <>
          <section className="tracking-overview-grid">
            <div className="tracking-info-card">
              <span>WASTE ID</span>
              <strong>
                {trackedWaste?.wasteId || "—"}
              </strong>
              <small>
                {trackedWaste?.type || "Waste record"}
              </small>
            </div>

            <div className="tracking-info-card">
              <span>COLLECTION ID</span>
              <strong>
                {trackedCollection?.collectionId || "Not scheduled"}
              </strong>
              <small>
                {trackedCollection
                  ? "Collection linked"
                  : "No pickup scheduled"}
              </small>
            </div>

            <div className="tracking-info-card">
              <span>CURRENT STATUS</span>
              <strong
                className={`tracking-status-text ${
                  statusClass(collectionStatus)
                }`}
              >
                {collectionStatus ||
                  trackedWaste?.status ||
                  "Pending"}
              </strong>
              <small>Live database status</small>
            </div>

            <div className="tracking-info-card">
              <span>WEIGHT</span>
              <strong>
                {trackedWaste?.weight ?? "—"} kg
              </strong>
              <small>
                {trackedWaste?.bin
                  ? `${trackedWaste.bin} bin`
                  : "Waste record"}
              </small>
            </div>
          </section>

          <section className="tracking-main-grid">
            <div className="tracking-timeline-card">
              <div className="tracking-card-header">
                <div>
                  <span className="tracking-eyebrow">
                    JOURNEY
                  </span>
                  <h3>Waste Lifecycle</h3>
                </div>

                {collectionStatus && (
                  <span
                    className={`tracking-pill ${statusClass(
                      collectionStatus
                    )}`}
                  >
                    {collectionStatus}
                  </span>
                )}
              </div>

              <div className="tracking-timeline">
                {timeline.map((item, index) => (
                  <div
                    className={`tracking-step ${
                      item.active ? "active" : ""
                    }`}
                    key={item.key}
                  >
                    <div className="tracking-step-marker">
                      {item.active ? "✓" : index + 1}
                    </div>

                    <div className="tracking-step-content">
                      <div className="tracking-step-top">
                        <h4>{item.title}</h4>
                        <span>{item.meta}</span>
                      </div>
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="tracking-details-card">
              <div className="tracking-card-header">
                <div>
                  <span className="tracking-eyebrow">
                    RECORD DETAILS
                  </span>
                  <h3>Collection Information</h3>
                </div>
              </div>

              <div className="tracking-detail-list">
                <div>
                  <span>Waste Type</span>
                  <strong>
                    {trackedWaste?.type || "—"}
                  </strong>
                </div>

                <div>
                  <span>Category</span>
                  <strong>
                    {trackedWaste?.category || "—"}
                  </strong>
                </div>

                <div>
                  <span>Department</span>
                  <strong>
                    {trackedWaste?.department || "—"}
                  </strong>
                </div>

                <div>
                  <span>Collector</span>
                  <strong>
                    {trackedCollection?.collectorName ||
                      "Not assigned"}
                  </strong>
                </div>

                <div>
                  <span>Collector Phone</span>
                  <strong>
                    {trackedCollection?.collectorPhone ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>Vehicle</span>
                  <strong>
                    {trackedCollection?.vehicleNumber ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>Scheduled</span>
                  <strong>
                    {trackedCollection?.scheduledDate
                      ? new Date(
                          trackedCollection.scheduledDate
                        ).toLocaleString()
                      : "Not scheduled"}
                  </strong>
                </div>
              </div>

              {trackedCollection && (
                <div className="tracking-actions">
                  <span>UPDATE COLLECTION STATUS</span>

                  {collectionStatus === "Scheduled" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateCollectionStatus(
                          "Collected"
                        )
                      }
                      disabled={updating}
                    >
                      {updating
                        ? "Updating..."
                        : "✓ Mark Collected"}
                    </button>
                  )}

                  {collectionStatus === "Collected" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateCollectionStatus(
                          "In Transit"
                        )
                      }
                      disabled={updating}
                    >
                      {updating
                        ? "Updating..."
                        : "→ Start Transit"}
                    </button>
                  )}

                  {collectionStatus === "In Transit" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateCollectionStatus(
                          "Completed"
                        )
                      }
                      disabled={updating}
                    >
                      {updating
                        ? "Updating..."
                        : "✓ Mark Completed"}
                    </button>
                  )}

                  {collectionStatus === "Completed" && (
                    <div className="tracking-complete-message">
                      ✓ Collection workflow completed
                    </div>
                  )}
                </div>
              )}
            </aside>
          </section>
        </>
      ) : (
        <section className="tracking-empty-card">
          <div className="tracking-empty-icon">⌖</div>
          <span className="tracking-eyebrow">
            READY TO TRACK
          </span>
          <h3>Search a Waste Record</h3>
          <p>
            Enter a Waste ID or Collection ID above to
            see its real-time lifecycle and collection
            details.
          </p>

          {allTrackableRecords.length > 0 && (
            <div className="tracking-examples">
              <span>Available examples:</span>

              <div>
                {allTrackableRecords
                  .slice(0, 3)
                  .map((record) => (
                    <button
                      type="button"
                      key={
                        record.collection?._id ||
                        record.waste?._id
                      }
                      onClick={() => {
                        const id =
                          record.collection?.collectionId ||
                          record.waste?.wasteId ||
                          "";
                        setTrackingId(id);
                        findRecord(id);
                      }}
                    >
                      {record.collection?.collectionId ||
                        record.waste?.wasteId}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default TrackingSection;
