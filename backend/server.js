require("dotenv").config();

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const wasteRoutes = require("./routes/waste.routes");
const collectionRoutes = require("./routes/collection.routes");

const app = express();

/* =========================
   CORS
========================= */

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://biotrack-ai-frontend.vercel.app",
      "https://sih-2026-project.netlify.app",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

/* =========================
   BODY PARSER
========================= */

app.use(express.json());

/* =========================
   DATABASE
========================= */

connectDB();

/* =========================
   API ROUTES
========================= */

// Authentication
app.use("/api/auth", authRoutes);

// Waste management
app.use("/api/waste", wasteRoutes);

// Collection management
app.use("/api/collections", collectionRoutes);

/* =========================
   HEALTH / ROOT ROUTE
========================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "BioTrack-AI Backend is running successfully",
  });
});

/* =========================
   SERVER
========================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `BioTrack-AI server running on http://localhost:${PORT}`
  );
});