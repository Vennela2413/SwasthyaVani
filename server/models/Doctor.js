const router = require("express").Router();
const Doctor = require("../models/Doctor");

const SAMPLE_DOCTORS = [
  { name:"PHC Uppal",                   type:"Government PHC",          phone:"104",        village:"Uppal",      district:"Hyderabad",          isGovernment:true,  isOpen:true, location:{ type:"Point", coordinates:[78.5595,17.4065] } },
  { name:"Dr. Ramaiah Clinic",          type:"General Physician",       phone:"9876543210", village:"Boduppal",   district:"Hyderabad",          isGovernment:false, isOpen:true, location:{ type:"Point", coordinates:[78.5700,17.4100] } },
  { name:"CHC Medchal",                 type:"Community Health Centre", phone:"104",        village:"Medchal",    district:"Medchal-Malkajgiri", isGovernment:true,  isOpen:true, location:{ type:"Point", coordinates:[78.4800,17.6200] } },
  { name:"Dr. Lakshmi Clinic",          type:"General Physician",       phone:"9988776655", village:"Ghatkesar",  district:"Medchal-Malkajgiri", isGovernment:false, isOpen:true, location:{ type:"Point", coordinates:[78.6900,17.4500] } },
  { name:"Janani Rural Hospital",       type:"Multi-specialty",         phone:"9123456789", village:"LB Nagar",   district:"Hyderabad",          isGovernment:false, isOpen:true, location:{ type:"Point", coordinates:[78.5500,17.3500] } },
  { name:"Area Hospital Nizamabad",     type:"Government Hospital",     phone:"104",        village:"Nizamabad",  district:"Nizamabad",          isGovernment:true,  isOpen:true, location:{ type:"Point", coordinates:[78.0941,18.6726] } },
  { name:"PHC Warangal",                type:"Government PHC",          phone:"104",        village:"Warangal",   district:"Warangal",           isGovernment:true,  isOpen:true, location:{ type:"Point", coordinates:[79.5941,17.9784] } },
  { name:"District Hospital Karimnagar",type:"Government Hospital",     phone:"104",        village:"Karimnagar", district:"Karimnagar",         isGovernment:true,  isOpen:true, location:{ type:"Point", coordinates:[79.1288,18.4386] } },
  { name:"PHC Nandyal",                 type:"Government PHC",          phone:"104",        village:"Nandyal",    district:"Kurnool",            isGovernment:true,  isOpen:true, location:{ type:"Point", coordinates:[78.4833,15.4833] } },
  { name:"District Hospital Guntur",    type:"Government Hospital",     phone:"104",        village:"Guntur",     district:"Guntur",             isGovernment:true,  isOpen:true, location:{ type:"Point", coordinates:[80.4365,16.3067] } },
  { name:"PHC Vijayawada",              type:"Government PHC",          phone:"104",        village:"Vijayawada", district:"Krishna",            isGovernment:true,  isOpen:true, location:{ type:"Point", coordinates:[80.6480,16.5062] } },
  { name:"RIMS Hospital Kadapa",        type:"Government Hospital",     phone:"104",        village:"Kadapa",     district:"YSR Kadapa",         isGovernment:true,  isOpen:true, location:{ type:"Point", coordinates:[78.8242,14.4674] } },
];

router.get("/nearby", async (req, res) => {
  try {
    // ── Always seed if empty ───────────────────────────────────────────
    const count = await Doctor.countDocuments();
    if (count === 0) {
      await Doctor.insertMany(SAMPLE_DOCTORS);
      console.log("✅ Seeded", SAMPLE_DOCTORS.length, "doctors");
    }

    const { lat, lng, maxDist = 150000 } = req.query;
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    const hasGPS    = !isNaN(parsedLat) && !isNaN(parsedLng);

    let doctors = [];

    // ── Try geo query if GPS available ────────────────────────────────
    if (hasGPS) {
      try {
        doctors = await Doctor.find({
          location: {
            $near: {
              $geometry: { type: "Point", coordinates: [parsedLng, parsedLat] },
              $maxDistance: parseInt(maxDist),
            },
          },
        }).limit(10);
      } catch (geoErr) {
        console.warn("⚠️  Geo query failed:", geoErr.message);
        doctors = []; // fall through to plain find below
      }
    }

    // ── Fallback: return ALL doctors sorted govt first ─────────────────
    if (doctors.length === 0) {
      doctors = await Doctor.find({}).sort({ isGovernment: -1 }).limit(12);
    }

    res.json({ doctors, count: doctors.length, gpsUsed: hasGPS });

  } catch (err) {
    console.error("❌ Doctors route error:", err.message);
    // Last resort — return hardcoded sample so UI never shows empty
    res.json({ doctors: SAMPLE_DOCTORS.slice(0, 8), count: 8, gpsUsed: false, fallback: true });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { q = "" } = req.query;
    const doctors = await Doctor.find({
      $or: [
        { name:     { $regex: q, $options: "i" } },
        { village:  { $regex: q, $options: "i" } },
        { district: { $regex: q, $options: "i" } },
      ],
    }).limit(10);
    res.json({ doctors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;