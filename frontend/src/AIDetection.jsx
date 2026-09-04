import { useEffect, useRef, useState } from "react";
import "./AIDetection.css";

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
      "Keep away from general waste."
    ]
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
      "Avoid mixing with general waste."
    ]
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
      "Follow hospital decontamination procedures."
    ]
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
      "Handle broken glass carefully."
    ]
  }
];

function AIDetection() {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [showSourcePicker, setShowSourcePicker] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

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

  const handleAnalyze = () => {
    if (!selectedFile) {
      setError("Please upload a waste image first.");
      return;
    }

    setError("");
    setResult(null);
    setIsAnalyzing(true);

    // Demo analysis delay.
    // This will later be replaced by the real AI model/API.
    setTimeout(() => {
      const fileName = selectedFile.name.toLowerCase();

      let detectedResult;

      if (
        fileName.includes("syringe") ||
        fileName.includes("needle") ||
        fileName.includes("sharp")
      ) {
        detectedResult = demoResults[0];
      } else if (
        fileName.includes("dressing") ||
        fileName.includes("bandage") ||
        fileName.includes("blood")
      ) {
        detectedResult = demoResults[1];
      } else if (
        fileName.includes("iv") ||
        fileName.includes("tube") ||
        fileName.includes("plastic")
      ) {
        detectedResult = demoResults[2];
      } else if (
        fileName.includes("vial") ||
        fileName.includes("medicine") ||
        fileName.includes("glass")
      ) {
        detectedResult = demoResults[3];
      } else {
        detectedResult =
          demoResults[Math.floor(Math.random() * demoResults.length)];
      }

      setResult(detectedResult);
      setIsAnalyzing(false);
    }, 1800);
  };

  const handleReset = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl("");
    setResult(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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

            <h3 id="ai-source-picker-title">Choose Image Source</h3>
            <p>Take a new photo or select an existing waste image.</p>

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

              <h2>
                Biomedical Waste Detection
              </h2>
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
              <span className="card-label">
                STEP 01
              </span>

              <h3>
                Upload Waste Image
              </h3>
            </div>

            <div className="step-number">
              01
            </div>

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
                <div className="upload-big-icon">
                  ↑
                </div>

                <h4>
                  Upload an image
                </h4>

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

          {/* Camera picker — opens the device camera on supported mobile browsers */}
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

              <div className="file-icon">
                IMG
              </div>

              <div className="file-details">
                <strong>
                  {selectedFile.name}
                </strong>

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
              <>
                ✦ Analyze Waste
              </>
            )}
          </button>

        </div>


        {/* RIGHT - RESULT */}

        <div className="ai-card result-card">

          <div className="card-heading">

            <div>
              <span className="card-label">
                STEP 02
              </span>

              <h3>
                Detection Result
              </h3>
            </div>

            <div className="step-number">
              02
            </div>

          </div>


          {!result && !isAnalyzing && (
            <div className="empty-result">

              <div className="ai-scan-animation">
                <span>✦</span>
              </div>

              <h4>
                Waiting for analysis
              </h4>

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

              <h4>
                Analyzing image...
              </h4>

              <p>
                BioTrack AI is processing the uploaded
                waste image.
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


          {result && !isAnalyzing && (
            <div className="result-content">

              {/* Detection */}

              <div className="detected-item">

                <div className="detected-icon">
                  {result.icon}
                </div>

                <div>
                  <span>
                    DETECTED WASTE
                  </span>

                  <h4>
                    {result.name}
                  </h4>

                  <p>
                    {result.category}
                  </p>
                </div>

                <div className="confidence-badge">
                  {result.confidence}
                  <small>confidence</small>
                </div>

              </div>


              {/* Result Grid */}

              <div className="result-grid">

                <div className="result-box">

                  <span>
                    RECOMMENDED BIN
                  </span>

                  <div className="bin-result">

                    <div
                      className={`bin-color ${result.color}`}
                    ></div>

                    <strong>
                      {result.bin} Bin
                    </strong>

                  </div>

                </div>


                <div className="result-box">

                  <span>
                    RISK LEVEL
                  </span>

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

                  <div className="guidance-icon">
                    ✓
                  </div>

                  <div>
                    <strong>
                      Disposal Guidance
                    </strong>

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
                >
                  ↻ New Scan
                </button>

                <button
                  type="button"
                  className="save-result-btn"
                  onClick={() =>
                    alert(
                      "Scan result will be saved to the database when backend integration is connected."
                    )
                  }
                >
                  ✓ Save Result
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
            <strong>
              Safer Segregation
            </strong>

            <p>
              Helps staff identify the appropriate
              biomedical waste category before disposal.
            </p>
          </div>
        </div>


        <div className="ai-info-card">
          <div className="info-icon">⚡</div>

          <div>
            <strong>
              Fast Analysis
            </strong>

            <p>
              Designed for quick image-based waste
              classification during hospital operations.
            </p>
          </div>
        </div>


        <div className="ai-info-card">
          <div className="info-icon">📊</div>

          <div>
            <strong>
              Traceable Results
            </strong>

            <p>
              Detection results can later be connected
              with waste tracking and analytics.
            </p>
          </div>
        </div>

      </div>


      {/* Prototype Notice */}

      <div className="ai-prototype-notice">
        <span>ⓘ</span>

        <p>
          <strong>Prototype Mode:</strong> The current
          classification is a frontend demonstration.
          A trained computer-vision model will be connected
          in the AI integration phase.
        </p>
      </div>

    </section>
    </>
  );
}

export default AIDetection;