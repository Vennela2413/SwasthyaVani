const router = require("express").Router();
const Doctor = require("../models/Doctor");

// Seed some sample doctors (run once)
const SAMPLE_DOCTORS = [
  { name: "PHC Uppal", type: "Government PHC", phone: "104", address: "Uppal, Hyderabad", village: "Uppal", district: "Hyderabad", isGovernment: true, location: { type: "Point", coordinates: [78.5595, 17.4065] } },
  { name: "Dr. Ramaiah Clinic", type: "General Physician", phone: "9876543210", address: "Boduppal, Hyderabad", village: "Boduppal", district: "Hyderabad", location: { type: "Point", coordinates: [78.5700, 17.4100] } },
  { name: "CHC Medchal", type: "Community Health Centre", phone: "104", address: "Medchal, Telangana", village: "Medchal", district: "Medchal-Malkajgiri", isGovernment: true, location: { type: "Point", coordinates: [78.4800, 17.6200] } },
  { name: "Dr. Lakshmi Ayurvedic", type: "Ayurvedic Clinic", phone: "9988776655", address: "Ghatkesar, Hyderabad", village: "Ghatkesar", district: "Medchal-Malkajgiri", location: { type: "Point", coordinates: [78.6900, 17.4500] } },
  { name: "Janani Rural Hospital", type: "Multi-specialty", phone: "9123456789", address: "LB Nagar, Hyderabad", village: "LB Nagar", district: "Hyderabad", location: { type: "Point", coordinates: [78.5500, 17.3500] } },
  { name: "Area Hospital Nizamabad", type: "Government Hospital", phone: "104", address: "Nizamabad, Telangana", village: "Nizamabad", district: "Nizamabad", isGovernment: true, location: { type: "Point", coordinates: [78.0941, 18.6726] } },
  { name: "PHC Warangal Rural", type: "Government PHC", phone: "104", address: "Warangal Rural, Telangana", village: "Warangal", district: "Warangal", isGovernment: true, location: { type: "Point", coordinates: [79.5941, 17.9784] } },
];

// GET /api/doctors/nearby?lat=17.4065&lng=78.5595&maxDist=20000
router.get("/nearby", async (req, res) => {
  try {
    // Seed on first request if empty
    const count = await Doctor.countDocuments();
    if (count === 0) await Doctor.insertMany(SAMPLE_DOCTORS);

    const { lat, lng, maxDist = 50000 } = req.query; // maxDist in meters (default 50km)

    let doctors;
    if (lat && lng) {
      doctors = await Doctor.find({
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: parseInt(maxDist),
          }
        }
      }).limit(10);
    } else {
      // No location provided — return all
      doctors = await Doctor.find().limit(10);
    }

    res.json({ doctors, count: doctors.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/doctors/search?q=uppal
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    const doctors = await Doctor.find({
      $or: [
        { name:     { $regex: q, $options: "i" } },
        { village:  { $regex: q, $options: "i" } },
        { district: { $regex: q, $options: "i" } },
        { type:     { $regex: q, $options: "i" } },
      ]
    }).limit(10);
    res.json({ doctors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/doctors — Add a doctor (admin use)
router.post("/", async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
