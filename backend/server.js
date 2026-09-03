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

app.use(cors());
app.use(express.json());

connectDB();

// Auth routes
app.use("/api/auth", authRoutes);
app.use("/api/waste", wasteRoutes);
app.use("/api/collections", collectionRoutes);
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "BioTrack-AI Backend is running successfully",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`BioTrack-AI server running on http://localhost:${PORT}`);
});