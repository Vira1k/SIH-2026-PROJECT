import { useEffect, useRef, useState } from "react";
import "./AIDetection.css";

const AI_API_URL =
  import.meta.env.VITE_AI_API_URL || "http://localhost:8000";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://sih-2026-project-u1ga.onrender.com/api";

const demoResults = [
  {
    name: "Used Syringe",
    category: "Sharps",
    bin: "White",
    risk: "High",
    confidence: "96.4%",
    icon: "💉",
    color: "white",
    guidance: [
      "Do not recap or bend the syringe.",
      "Place immediately in a puncture-proof container.",
      "Keep away from general waste.",
    ],
  },
  {
    name: "Blood-Soaked Dressing",
    category: "Soiled Waste",
    bin: "Yellow",
    risk: "High",
    confidence: "94.8%",
    icon: "🩹",
    color: "yellow",
    guidance: [
      "Handle using appropriate protective equipment.",
      "Place in the designated yellow biomedical waste bag.",
      "Avoid mixing with general waste.",
    ],
  },
  {
    name: "Used IV Tube",
    category: "Contaminated Plastic",
    bin: "Red",
    risk: "Medium",
    confidence: "92.7%",
    icon: "🧪",
    color: "red",
    guidance: [
      "Separate contaminated plastic from other waste.",
      "Place in the designated red biomedical waste bag.",
      "Follow hospital decontamination procedures.",
    ],
  },
  {
    name: "Medicine Vial",
    category: "Glass / Pharmaceutical Waste",
    bin: "Blue",
    risk: "Medium",
    confidence: "91.9%",
    icon: "💊",
    color: "blue",
    guidance: [
      "Keep glass containers separated from general waste.",
      "Place in the designated blue container.",
      "Handle broken glass carefully.",
    ],
  },
];

const AI_RESULT_CONFIG = {
  glove: {
    name: "Glove",
    category: "Contaminated Plastic",
    risk: "Medium",
    color: "red",
    guidance: [
      "Handle contaminated gloves using appropriate protective equipment.",
      "Place in the designated red biomedical waste bag.",
      "Do not mix contaminated plastic waste with general waste.",
    ],
  },

  gauze: {
    name: "Blood-Soaked Gauze",
    category: "Soiled Waste",
    risk: "High",
    color: "yellow",
    guidance: [
      "Handle using appropriate protective equipment.",
      "Place in the designated yellow biomedical waste bag.",
      "Avoid mixing soiled waste with general waste.",
    ],
  },

  urine_bag: {
    name: "Urine Bag",
    category: "Contaminated Plastic",
    risk: "Medium",
    color: "red",
    guidance: [
      "Handle the contaminated bag using appropriate protective equipment.",
      "Place in the designated red biomedical waste bag.",
      "Follow hospital procedures for contaminated plastic waste.",
    ],
  },

  test_tube: {
    name: "Test Tube",
    category: "Glass / Laboratory Waste",
    risk: "Medium",
    color: "blue",
    guidance: [
      "Handle laboratory glassware carefully.",
      "Place in the designated blue biomedical waste container.",
      "Do not place broken glass in regular waste.",
    ],
  },

  medical_glasses: {
    name: "Medical Glasses",
    category: "Glass Waste",
    risk: "Medium",
    color: "blue",
    guidance: [
      "Handle the glass item carefully to avoid breakage.",
      "Place in the designated blue biomedical waste container.",
      "Keep glass waste separated from general waste.",
    ],
  },
};

function buildAIResult(detection) {
  const itemKey = String(detection.item || "").toLowerCase();
  const config = AI_RESULT_CONFIG[itemKey];

  if (!config) {
    return {
      name: detection.item || "Unknown Item",
      category: "Unsupported / Review Required",
      bin: detection.bin || "Review Required",
      risk: "Review",
      confidence: `${Number(
        detection.confidencePercent ||
          Number(detection.confidence || 0) * 100
      ).toFixed(1)}%`,
      icon: "⚠️",
      color: "yellow",
      guidance: [
        "The current AI model does not have a verified disposal rule for this item.",
        "Do not rely on an automatic bin recommendation.",
        "Verify the item with hospital biomedical-waste guidelines before segregation.",
      ],
    };
  }

  const confidencePercent =
    detection.confidencePercent !== undefined
      ? Number(detection.confidencePercent)
      : Number(detection.confidence || 0) * 100;

  return {
    ...config,
    bin: detection.bin || "Review Required",
    confidence: `${confidencePercent.toFixed(1)}%`,
    icon:
      itemKey === "glove"
        ? "🧤"
        : itemKey === "gauze"
        ? "🩹"
        : itemKey === "urine_bag"
        ? "🧴"
        : itemKey === "test_tube"
        ? "🧪"
        : "🥽",
  };
}

function AIDetection() {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [showSourcePicker, setShowSourcePicker] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [result, setResult] = useState(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");
  const [noDetection, setNoDetection] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setResult(null);
    setNoDetection(false);

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10MB.");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const newPreviewUrl = URL.createObjectURL(file);

    setSelectedFile(file);
    setPreviewUrl(newPreviewUrl);
  };

  const handleUploadClick = () => {
    setShowSourcePicker(true);
  };

  const handleGallerySelect = () => {
    setShowSourcePicker(false);
    fileInputRef.current?.click();
  };

  const handleCameraSelect = () => {
    setShowSourcePicker(false);
    cameraInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please upload a waste image first.");
      return;
    }

    setError("");
    setResult(null);
    setNoDetection(false);
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(`${AI_API_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        throw new Error("AI service returned an invalid response.");
      }

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.detail || "AI service could not analyze this image."
        );
      }

      const detections = Array.isArray(data.detections)
        ? data.detections
        : [];

      if (detections.length === 0) {
        setNoDetection(true);
        return;
      }

      const bestDetection = [...detections].sort(
        (a, b) =>
          Number(b.confidence || 0) - Number(a.confidence || 0)
      )[0];

      const confidence = Number(bestDetection.confidence || 0);

      if (confidence < 0.5) {
        setNoDetection(true);
        setError(
          "The AI could not confidently identify biomedical waste in this image. Please retake the photo with the waste item clearly visible."
        );
        return;
      }

      setResult(buildAIResult(bestDetection));
    } catch (requestError) {
      console.error("AI detection error:", requestError);

      setError(
        requestError?.message?.includes("Failed to fetch")
          ? "AI service is not running. Start the BioTrack-AI detection service on port 8000 and try again."
          : requestError?.message || "Unable to analyze the image."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveResult = async () => {
    if (!result) {
      alert("No AI result available to save.");
      return;
    }

    const token = localStorage.getItem("biotrackToken");

    if (!token) {
      alert("Your session has expired. Please sign in again.");

      localStorage.removeItem("biotrackLoggedIn");
      localStorage.removeItem("biotrackToken");

      window.location.reload();
      return;
    }

    if (
      !result.category ||
      !result.bin ||
      result.category === "Unsupported / Review Required" ||
      result.bin === "Review Required"
    ) {
      alert(
        "This AI result requires manual verification and cannot be automatically saved."
      );
      return;
    }

    const confidence = Number(
      String(result.confidence).replace("%", "")
    );

    try {
      setIsSaving(true);
      setError("");

      const response = await fetch(`${API_URL}/waste`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: result.name,
          category: result.category,
          bin: result.bin,
          weight: 0.1,
          department: "AI Detection",
          aiConfidence: confidence,
          aiDetected: true,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem("biotrackLoggedIn");
        localStorage.removeItem("biotrackToken");

        alert("Your session has expired. Please sign in again.");

        window.location.reload();
        return;
      }

      let data = {};

      try {
        data = await response.json();
      } catch {
        throw new Error("Backend returned an invalid response.");
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to save AI result."
        );
      }

      const savedRecord = data.record;

      alert(
        savedRecord?.wasteId
          ? `AI result saved successfully.\nWaste ID: ${savedRecord.wasteId}`
          : "AI result saved successfully."
      );
    } catch (saveError) {
      console.error("Save AI result error:", saveError);

      setError(
        saveError?.message ||
          "Unable to save the AI result to the BioTrack-AI database."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl("");
    setResult(null);
    setError("");
    setNoDetection(false);
    setIsSaving(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  };

  return (
    <>
      {showSourcePicker && (
        <div
          className="ai-source-picker-backdrop"
          onClick={() => setShowSourcePicker(false)}
          role="presentation"
        >
          <div
            className="ai-source-picker"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-source-picker-title"
          >
            <button
              type="button"
              className="ai-source-picker-close"
              onClick={() => setShowSourcePicker(false)}
              aria-label="Close image source picker"
            >
              ×
            </button>

            <div className="ai-source-picker-icon">✦</div>

            <h3 id="ai-source-picker-title">
              Choose Image Source
            </h3>

            <p>
              Take a new photo or select an existing waste image.
            </p>

            <div className="ai-source-options">
              <button
                type="button"
                className="ai-source-option"
                onClick={handleCameraSelect}
              >
                <span className="ai-source-option-icon">📷</span>

                <span>
                  <strong>Take Photo</strong>
                  <small>Use your camera</small>
                </span>
              </button>

              <button
                type="button"
                className="ai-source-option"
                onClick={handleGallerySelect}
              >
                <span className="ai-source-option-icon">🖼️</span>

                <span>
                  <strong>Choose from Gallery</strong>
                  <small>Select an existing image</small>
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="ai-detection-page">
        {/* ================= HEADER ================= */}

        <div className="ai-page-header">
          <div>
            <div className="ai-title-row">
              <div className="ai-title-icon">✦</div>

              <div>
                <span className="ai-eyebrow">
                  AI POWERED ANALYSIS
                </span>

                <h2>Biomedical Waste Detection</h2>
              </div>
            </div>

            <p>
              Upload an image of biomedical waste and analyze it
              for category, risk level and recommended segregation.
            </p>
          </div>

          <div className="ai-status">
            <span></span>
            AI SYSTEM READY
          </div>
        </div>

        {/* ================= MAIN WORKSPACE ================= */}

        <div className="ai-workspace">
          {/* LEFT - UPLOAD */}

          <div className="ai-card upload-card">
            <div className="card-heading">
              <div>
                <span className="card-label">STEP 01</span>

                <h3>Upload Waste Image</h3>
              </div>

              <div className="step-number">01</div>
            </div>

            <div
              className={
                previewUrl
                  ? "ai-upload-area has-preview"
                  : "ai-upload-area"
              }
            >
              {!previewUrl ? (
                <>
                  <div className="upload-big-icon">↑</div>

                  <h4>Upload an image</h4>

                  <p>
                    Take a photo with your camera or select a file
                    from your device.
                  </p>

                  <button
                    type="button"
                    className="primary-ai-btn"
                    onClick={handleUploadClick}
                  >
                    Choose Image
                  </button>

                  <span className="upload-limit">
                    JPG, JPEG or PNG • Maximum 10MB
                  </span>
                </>
              ) : (
                <div className="image-preview-wrapper">
                  <img
                    src={previewUrl}
                    alt="Selected biomedical waste"
                    className="waste-preview"
                  />

                  <div className="preview-overlay">
                    <button
                      type="button"
                      onClick={handleUploadClick}
                    >
                      Change Image
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Gallery picker */}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleFileSelect}
              hidden
            />

            {/* Camera picker */}

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              hidden
            />

            {selectedFile && (
              <div className="selected-file">
                <div className="file-icon">IMG</div>

                <div className="file-details">
                  <strong>{selectedFile.name}</strong>

                  <span>
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>

                <button
                  type="button"
                  className="remove-file"
                  onClick={handleReset}
                >
                  ×
                </button>
              </div>
            )}

            {error && (
              <div className="ai-error">
                ⚠ {error}
              </div>
            )}

            <button
              type="button"
              className="analyze-btn"
              onClick={handleAnalyze}
              disabled={!selectedFile || isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <span className="ai-spinner"></span>
                  Analyzing Waste...
                </>
              ) : (
                <>✦ Analyze Waste</>
              )}
            </button>
          </div>

          {/* RIGHT - RESULT */}

          <div className="ai-card result-card">
            <div className="card-heading">
              <div>
                <span className="card-label">STEP 02</span>

                <h3>Detection Result</h3>
              </div>

              <div className="step-number">02</div>
            </div>

            {!result && !isAnalyzing && !noDetection && (
              <div className="empty-result">
                <div className="ai-scan-animation">
                  <span>✦</span>
                </div>

                <h4>Waiting for analysis</h4>

                <p>
                  Upload a waste image and click
                  <strong> Analyze Waste </strong>
                  to see the classification result.
                </p>

                <div className="result-features">
                  <span>✓ Waste Category</span>
                  <span>✓ Recommended Bin</span>
                  <span>✓ Risk Assessment</span>
                  <span>✓ AI Confidence</span>
                </div>
              </div>
            )}

            {isAnalyzing && (
              <div className="analyzing-state">
                <div className="analysis-loader">
                  <div></div>
                </div>

                <h4>Analyzing image...</h4>

                <p>
                  Your trained BioTrack AI model is analyzing the
                  uploaded waste image.
                </p>

                <div className="analysis-steps">
                  <span className="completed">
                    ✓ Image received
                  </span>

                  <span className="active-step">
                    ◉ Identifying waste
                  </span>

                  <span>
                    ○ Generating recommendation
                  </span>
                </div>
              </div>
            )}

            {noDetection && !isAnalyzing && (
              <div className="empty-result ai-rejected-result">
                <div className="ai-rejection-icon">⚠️</div>

                <h4>No Biomedical Waste Detected</h4>

                <p>
                  BioTrack AI could not confidently identify a
                  supported biomedical waste item in this image.
                </p>

                <div className="ai-rejection-message">
                  <strong>
                    Please do not segregate based on this result.
                  </strong>

                  <span>
                    Retake the photo with the waste item clearly
                    visible and well-lit, or choose another image.
                  </span>
                </div>

                <button
                  type="button"
                  className="secondary-ai-btn"
                  onClick={handleReset}
                >
                  ↻ Try Another Image
                </button>
              </div>
            )}

            {result && !isAnalyzing && (
              <div className="result-content">
                {/* Detection */}

                <div className="detected-item">
                  <div className="detected-icon">
                    {result.icon}
                  </div>

                  <div>
                    <span>DETECTED WASTE</span>

                    <h4>{result.name}</h4>

                    <p>{result.category}</p>
                  </div>

                  <div className="confidence-badge">
                    {result.confidence}
                    <small>confidence</small>
                  </div>
                </div>

                {/* Result Grid */}

                <div className="result-grid">
                  <div className="result-box">
                    <span>RECOMMENDED BIN</span>

                    <div className="bin-result">
                      <div
                        className={`bin-color ${result.color}`}
                      ></div>

                      <strong>{result.bin} Bin</strong>
                    </div>
                  </div>

                  <div className="result-box">
                    <span>RISK LEVEL</span>

                    <div
                      className={`risk-result ${result.risk.toLowerCase()}`}
                    >
                      <span></span>
                      {result.risk}
                    </div>
                  </div>
                </div>

                {/* Guidance */}

                <div className="guidance-box">
                  <div className="guidance-header">
                    <div className="guidance-icon">✓</div>

                    <div>
                      <strong>Disposal Guidance</strong>

                      <span>
                        Recommended handling procedure
                      </span>
                    </div>
                  </div>

                  <ul>
                    {result.guidance.map((item, index) => (
                      <li key={index}>
                        <span>✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}

                <div className="result-actions">
                  <button
                    type="button"
                    className="secondary-ai-btn"
                    onClick={handleReset}
                    disabled={isSaving}
                  >
                    ↻ New Scan
                  </button>

                  <button
                    type="button"
                    className="save-result-btn"
                    onClick={handleSaveResult}
                    disabled={isSaving}
                  >
                    {isSaving
                      ? "Saving..."
                      : "✓ Save Result"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= INFO SECTION ================= */}

        <div className="ai-info-grid">
          <div className="ai-info-card">
            <div className="info-icon">🛡️</div>

            <div>
              <strong>Safer Segregation</strong>

              <p>
                Helps staff identify the appropriate biomedical
                waste category before disposal.
              </p>
            </div>
          </div>

          <div className="ai-info-card">
            <div className="info-icon">⚡</div>

            <div>
              <strong>Fast Analysis</strong>

              <p>
                Designed for quick image-based waste
                classification during hospital operations.
              </p>
            </div>
          </div>

          <div className="ai-info-card">
            <div className="info-icon">📊</div>

            <div>
              <strong>Traceable Results</strong>

              <p>
                Detection results can later be connected with
                waste tracking and analytics.
              </p>
            </div>
          </div>
        </div>

        {/* Prototype Notice */}

        <div className="ai-prototype-notice">
          <span>ⓘ</span>

          <p>
            <strong>AI Connected:</strong> This scan is processed
            by the custom BioTrack-AI computer-vision model trained
            for the current prototype. Always verify the
            recommendation before final segregation.
          </p>
        </div>
      </section>
    </>
  );
}

export default AIDetection;