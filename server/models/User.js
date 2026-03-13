const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  phone:    { type: String, required: true, unique: true, trim: true },
  village:  { type: String, trim: true, default: "" },
  district: { type: String, trim: true, default: "" },
  age:      { type: Number, default: 0 },
  gender:   { type: String, enum: ["male", "female", "other"], default: "other" },
  password: { type: String, required: true },
  language: { type: String, enum: ["en", "te", "hi"], default: "en" },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
