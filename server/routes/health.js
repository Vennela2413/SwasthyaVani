const router = require("express").Router();
const axios  = require("axios");
const jwt    = require("jsonwebtoken");
const auth   = require("../middleware/auth");
const HealthRecord = require("../models/HealthRecord");

const ML_URL = process.env.ML_SERVICE_URL || "http://localhost:5001";

// Disease database for offline predictions
const DISEASES = {
  "Malaria":         { s:["fever","chills","sweating","headache","nausea","vomiting","muscle pain","fatigue","shivering"], sev:"high",     e:"🦟", a:"Visit doctor immediately. Take prescribed antimalarial drugs. Use mosquito nets.", te:"మలేරియా", hi:"मलेरिया" },
  "Dengue":          { s:["skin rash","chills","joint pain","vomiting","fatigue","high fever","headache","nausea","pain behind eyes"], sev:"high",     e:"🩸", a:"See doctor immediately. Drink papaya leaf juice. Stay hydrated.", te:"డెంగ్యూ", hi:"डेंगू" },
  "Typhoid":         { s:["chills","vomiting","fatigue","high fever","headache","nausea","constipation","stomach pain","diarrhea"], sev:"high",     e:"🌡️", a:"Consult doctor urgently. Drink only boiled water.", te:"టైఫాయిడ్", hi:"टाइफाइड" },
  "Tuberculosis":    { s:["fatigue","weight loss","cough","high fever","breathlessness","night sweats","chest pain"], sev:"high",     e:"🫁", a:"Go to government hospital — TB treatment is FREE.", te:"క్షయవ్యాధి", hi:"तपेदिक" },
  "Jaundice":        { s:["yellow skin","yellow eyes","dark urine","fatigue","stomach pain","fever","nausea","itching"], sev:"high",     e:"💛", a:"See doctor immediately. Drink sugarcane juice.", te:"కామెర్లు", hi:"पीलिया" },
  "Heart Attack":    { s:["chest pain","breathlessness","sweating","vomiting","arm pain","dizziness","palpitations"], sev:"high",     e:"💔", a:"CALL 108 IMMEDIATELY.", te:"గుండె పోటు", hi:"दिल का दौरा" },
  "Pneumonia":       { s:["chills","fatigue","cough","high fever","breathlessness","chest pain"], sev:"high",     e:"🫀", a:"See doctor immediately. Rest well.", te:"న్యుమోనియా", hi:"निमोनिया" },
  "Diabetes":        { s:["frequent urination","excessive thirst","weight loss","blurred vision","fatigue","numbness"], sev:"moderate", e:"💉", a:"Control sugar. Exercise daily. Monitor blood sugar.", te:"మధుమేహం", hi:"मधुमेह" },
  "Hypertension":    { s:["headache","chest pain","dizziness","blurred vision","palpitations","nosebleed"], sev:"moderate", e:"❤️",  a:"Reduce salt. Exercise regularly. Take BP medicines.", te:"అధిక రక్తపోటు", hi:"उच्च रक्तचाप" },
  "Asthma":          { s:["cough","breathlessness","wheezing","chest tightness","fatigue"], sev:"moderate", e:"💨", a:"Keep inhaler always. Avoid dust and smoke.", te:"ఆస్తమా", hi:"दमा" },
  "Chicken Pox":     { s:["itching","skin rash","fatigue","high fever","headache","blisters"], sev:"moderate", e:"🔵", a:"Apply calamine lotion. Avoid scratching.", te:"చికెన్‌పాక్స్", hi:"चिकनपॉक्स" },
  "Anemia":          { s:["fatigue","weakness","pale skin","shortness of breath","dizziness","headache"], sev:"moderate", e:"🩺", a:"Eat iron-rich foods: spinach, jaggery, dates.", te:"రక్తహీనత", hi:"एनीमिया" },
  "Gastroenteritis": { s:["vomiting","diarrhea","stomach pain","nausea","fever","weakness"], sev:"moderate", e:"🫃", a:"Drink ORS. Eat light food. See doctor if continues.", te:"గ్యాస్ట్రోఎంటరైటిస్", hi:"आंत्रशोथ" },
  "Common Cold":     { s:["runny nose","sneezing","cough","sore throat","mild fever","headache","body ache"], sev:"mild",     e:"🤧", a:"Rest. Drink warm turmeric milk or ginger tea.", te:"జలుబు", hi:"सर्दी-जुकाम" },
  "Flu":             { s:["high fever","chills","body ache","headache","fatigue","cough","sore throat"], sev:"mild",     e:"🤒", a:"Rest completely. Paracetamol for fever.", te:"ఫ్లూ", hi:"फ्लू" },
  "Dehydration":     { s:["excessive thirst","dry mouth","dark urine","dizziness","fatigue","headache"], sev:"mild",     e:"💦", a:"Drink ORS and coconut water regularly.", te:"నిర్జలీకరణం", hi:"निर्जलीकरण" },
  "Sunstroke":       { s:["high fever","hot skin","headache","dizziness","nausea","confusion"], sev:"high",     e:"☀️", a:"Move to cool place. Apply cold cloth. Call 108.", te:"సన్‌స్ట్రోక్", hi:"लू लगना" },
};

const TE_MAP = {"జ్వరం":"fever","దగ్గు":"cough","తలనొప్పి":"headache","వాంతి":"vomiting","విరేచనాలు":"diarrhea","నీరసం":"fatigue","కడుపు నొప్పి":"stomach pain","చలి":"chills","దురద":"itching","శ్వాస":"breathlessness","ఛాతీ నొప్పి":"chest pain","కీళ్ళ నొప్పి":"joint pain","జలుబు":"runny nose","వికారం":"nausea","అలసట":"fatigue","దాహం":"excessive thirst"};
const HI_MAP = {"बुखार":"fever","खांसी":"cough","सिरदर्द":"headache","उल्टी":"vomiting","दस्त":"diarrhea","कमजोरी":"fatigue","पेट दर्द":"stomach pain","ठंड":"chills","खुजली":"itching","सांस की तकलीफ":"breathlessness","सीने में दर्द":"chest pain","जोड़ों का दर्द":"joint pain","नाक बहना":"runny nose","मतली":"nausea","थकान":"fatigue","प्यास":"excessive thirst","चक्कर":"dizziness"};

function localPredict(text) {
  let t = text.toLowerCase();
  Object.entries(TE_MAP).forEach(([k,v]) => { t = t.replace(new RegExp(k,"g"), v); });
  Object.entries(HI_MAP).forEach(([k,v]) => { t = t.replace(new RegExp(k,"g"), v); });
  const words = t.split(/[\s,،।\.;]+/).filter(w => w.length > 2);
  const scores = {};
  Object.entries(DISEASES).forEach(([name, d]) => {
    let hits = 0, matched = [];
    d.s.forEach(sym => {
      const found = words.some(w => sym.includes(w) && w.length > 3);
      if (found) { hits++; matched.push(sym); }
    });
    if (hits > 0) scores[name] = { hits, matched, total: d.s.length, ...d };
  });
  return Object.entries(scores).sort((a,b) => b[1].hits - a[1].hits).slice(0,4).map(([name, d]) => ({
    disease: name, confidence: Math.min(93, Math.round((d.hits/d.total)*100)+18),
    severity: d.sev, emoji: d.e, advice: d.a, telugu: d.te, hindi: d.hi,
    matched_symptoms: d.matched,
  }));
}

async function saveRecord(userId, symptoms, language, result) {
  try {
    const preds = (result.predictions || []).map(p => ({
      disease:    String(p.disease    || p.name     || "Unknown"),
      confidence: Number(p.confidence || 0),
      severity:   String(p.severity   || p.sev      || "mild"),
      emoji:      String(p.emoji      || p.e        || "🩺"),
      advice:     String(p.advice     || p.a        || ""),
      telugu:     String(p.telugu     || p.te       || ""),
      hindi:      String(p.hindi      || p.hi       || ""),
    }));

    const record = await HealthRecord.create({
      user:            userId,
      symptomsText:    symptoms,
      language:        language || "en",
      matchedSymptoms: result.matched_symptoms || [],
      predictions:     preds,
      emergency:       result.emergency || false,
    });

    console.log("✅ Health record saved:", record._id, "| User:", userId);
    return record;
  } catch (err) {
    console.error("❌ Save record failed:", err.message);
    throw err;
  }
}

// POST /api/health/predict — Call ML service and optionally save
router.post("/predict", async (req, res) => {
  try {
    const { symptoms, language = "en", save = false } = req.body;
    if (!symptoms?.trim()) return res.status(400).json({ error: "symptoms required" });

    // Try ML service first, fallback to local prediction
    let result;
    try {
      const mlRes = await axios.post(`${ML_URL}/predict`, { symptoms }, { timeout: 5000 });
      result = mlRes.data;
    } catch (err) {
      console.log("⚠️  ML service unavailable, using offline predictions");
      const predictions = localPredict(symptoms);
      result = {
        predictions,
        matched_symptoms: predictions[0]?.matched_symptoms || [],
        emergency: predictions[0]?.severity === "high",
        offline: true,
      };
    }

    // Optionally save if user is logged in (token in header)
    let saved = false;
    if (save) {
      try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (token) {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          await saveRecord(decoded.id, symptoms, language, result);
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
      return res.status(503).json({ error: "ML service unavailable. Using offline mode." });
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
