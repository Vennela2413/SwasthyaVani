const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User   = require("../models/User");
const auth   = require("../middleware/auth");

const makeToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

// POST /api/auth/register
router.post("/register", [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("phone").trim().notEmpty().withMessage("Phone is required"),
  body("password").isLength({ min: 4 }).withMessage("Password min 4 chars"),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, phone, password, village, district, age, gender, language } = req.body;

    if (await User.findOne({ phone }))
      return res.status(400).json({ error: "Phone already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, phone, password: hashed, village, district, age, gender, language: language || "en" });

    res.status(201).json({
      token: makeToken(user._id),
      user: { id: user._id, name: user.name, phone: user.phone, village: user.village, language: user.language }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Wrong password" });

    res.json({
      token: makeToken(user._id),
      user: { id: user._id, name: user.name, phone: user.phone, village: user.village, language: user.language }
    });
  } catch (err) {
    console.error("[auth/login] error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me — Get current user
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/auth/language — Update preferred language
router.put("/language", auth, async (req, res) => {
  try {
    const { language } = req.body;
    if (!["en", "te", "hi"].includes(language))
      return res.status(400).json({ error: "Invalid language" });
    await User.findByIdAndUpdate(req.user.id, { language });
    res.json({ message: "Language updated", language });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
