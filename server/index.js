const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load .env from the server folder even when starting the app from the repo root.
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth",    require("./routes/auth"));
app.use("/api/health",  require("./routes/health"));
app.use("/api/doctors", require("./routes/doctors"));

// Root
app.get("/", (req, res) => res.json({ message: "🏥 SwasthyaVani API is running", version: "1.0.0" }));

// Error handler (JSON responses for unexpected errors)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON body" });
  }
  res.status(err.status || 500).json({ error: err.message || "Something went wrong" });
});

// Validate required environment variables
if (!process.env.MONGODB_URI) {
  console.error("❌ Missing required env var: MONGODB_URI");
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error("❌ Missing required env var: JWT_SECRET");
  process.exit(1);
}

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
