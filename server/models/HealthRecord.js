const mongoose = require("mongoose");

const healthRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  symptomsText: {
    type: String,
    required: true,
    trim: true,
  },
  language: {
    type: String,
    enum: ["en", "te", "hi"],
    default: "en",
  },
  matchedSymptoms: {
    type: [String],
    default: [],
  },
  predictions: {
    type: [
      {
        disease: String,
        confidence: Number,
        severity: { type: String, enum: ["mild", "moderate", "high"] },
        emoji: String,
        advice: String,
        telugu: String,
        hindi: String,
      },
    ],
    default: [],
  },
  emergency: {
    type: Boolean,
    default: false,
  },
  notes: {
    type: String,
    default: "",
  },
}, { timestamps: true });

module.exports = mongoose.model("HealthRecord", healthRecordSchema);