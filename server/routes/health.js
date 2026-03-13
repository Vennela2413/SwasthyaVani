const router = require("express").Router();
const axios  = require("axios");
const auth   = require("../middleware/auth");
const HealthRecord = require("../models/HealthRecord");

const ML_URL = process.env.ML_SERVICE_URL || "http://localhost:5001";

// POST /api/health/predict — Call ML service and optionally save
router.post("/predict", async (req, res) => {
  try {
    const { symptoms, language = "en", save = false } = req.body;
    if (!symptoms?.trim()) return res.status(400).json({ error: "symptoms required" });

    // Call Python ML service
    const mlRes = await axios.post(`${ML_URL}/predict`, { symptoms });
    const result = mlRes.data;

    // Optionally save if user is logged in (token in header)
    let saved = false;
    if (save) {
      try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        console.log("/predict save requested", { save, hasToken: Boolean(token) });
        if (token) {
          const jwt = require("jsonwebtoken");
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          await HealthRecord.create({
            user: decoded.id,
            symptomsText: symptoms,
            language,
            matchedSymptoms: result.matched_symptoms || [],
            predictions:    result.predictions || [],
            emergency:      result.emergency || false,
          });
          saved = true;
          console.log("/predict saved record for user", decoded.id);
        }
      } catch (err) {
        console.warn("/predict save failed", err?.message);
      }
    }

    res.json({ ...result, saved });
  } catch (err) {
    if (err.code === "ECONNREFUSED") {
      return res.status(503).json({ error: "ML service unavailable. Please start the Python service." });
    }
    res.status(500).json({ error: err.message });
  }
});

// POST /api/health/save — Save a health record (requires auth)
router.post("/save", auth, async (req, res) => {
  try {
    const { symptomsText, language, matchedSymptoms, predictions, emergency, notes } = req.body;
    const record = await HealthRecord.create({
      user: req.user.id,
      symptomsText,
      language: language || "en",
      matchedSymptoms: matchedSymptoms || [],
      predictions: predictions || [],
      emergency: emergency || false,
      notes: notes || "",
    });
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/health/history — Get user's health history (requires auth)
router.get("/history", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const records = await HealthRecord
      .find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await HealthRecord.countDocuments({ user: req.user.id });
    res.json({ records, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/health/history/:id — Delete a record (requires auth)
router.delete("/history/:id", auth, async (req, res) => {
  try {
    const record = await HealthRecord.findOne({ _id: req.params.id, user: req.user.id });
    if (!record) return res.status(404).json({ error: "Record not found" });
    await record.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/health/stats — Get user health summary
router.get("/stats", auth, async (req, res) => {
  try {
    const records = await HealthRecord.find({ user: req.user.id });
    const total = records.length;
    const mild = records.filter(r => r.predictions[0]?.severity === "mild").length;
    const moderate = records.filter(r => r.predictions[0]?.severity === "moderate").length;
    const serious = records.filter(r => r.predictions[0]?.severity === "high").length;
    const emergencies = records.filter(r => r.emergency).length;
    res.json({ total, mild, moderate, serious, emergencies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
