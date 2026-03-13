"""
=============================================================================
SwasthyaVani — Flask ML Service
Port: 5001
=============================================================================
Run after training:
  python train_model.py   ← train and select best model
  python app.py           ← start API
=============================================================================
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib, json, os, re, sys
import numpy as np

# Ensure UTF-8 output on Windows terminals so emoji/logging prints don't crash.
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

app = Flask(__name__)
CORS(app)

MODEL_DIR = "model"

# ─── Load Artifacts ───────────────────────────────────────────────────────────
print("🔄 Loading model artifacts...")
print("   [DEBUG] Loading label encoder...")
le            = joblib.load(f"{MODEL_DIR}/label_encoder.pkl")
print("   [DEBUG] Loading symptom list...")
ALL_SYMPTOMS  = joblib.load(f"{MODEL_DIR}/symptoms_list.pkl")
print("   [DEBUG] Loading scaler...")
scaler        = joblib.load(f"{MODEL_DIR}/scaler.pkl")
print("   [DEBUG] Model artifacts loaded.")

with open(f"{MODEL_DIR}/model_meta.json")                    as f: MODEL_META   = json.load(f)
with open(f"{MODEL_DIR}/disease_meta.json", encoding="utf-8") as f: DISEASE_META = json.load(f)

BEST_TYPE = MODEL_META["best_type"]
BEST_NAME = MODEL_META["best_model"]

model = None

# When TensorFlow/Keras is not usable (especially on some Windows setups),
# fall back to a sklearn-based model (XGBoost/RandomForest) so the service stays up.
SKLEARN_FALLBACKS = [
    ("XGBoost", "xgb_model.pkl"),
    ("Random Forest", "rf_model.pkl"),
]

def _load_sklearn_fallback():
    for name, fname in SKLEARN_FALLBACKS:
        path = f"{MODEL_DIR}/{fname}"
        if os.path.exists(path):
            print(f"✅ Loading fallback sklearn model: {name}")
            return name, joblib.load(path)
    raise FileNotFoundError("No sklearn fallback model found (xgb_model.pkl or rf_model.pkl missing).")

if BEST_TYPE == "dnn":
    # TensorFlow/Keras can crash on some Windows + Python combinations (access violation).
    # In that case we skip attempting to load the DNN and fall back to a sklearn model.
    if sys.platform.startswith("win"):
        print("⚠️ Running on Windows: skipping TensorFlow/DNN due to known stability issues. Using sklearn fallback.")
        BEST_TYPE = "sklearn"
        BEST_NAME = f"{BEST_NAME} (sklearn fallback)"
        BEST_NAME, model = _load_sklearn_fallback()
    else:
        try:
            import tensorflow as tf
            print("Loading Deep Neural Network model...")
            model = tf.keras.models.load_model(f"{MODEL_DIR}/best_model.keras", compile=False)
            print("✅ DNN model loaded successfully")
        except Exception as e:
            # Fallback to sklearn model so the service can still run.
            print("⚠️ Failed to load DNN model (TensorFlow/Keras). Falling back to sklearn model.")
            print(f"   Error: {e}")
            BEST_TYPE = "sklearn"
            BEST_NAME = f"{BEST_NAME} (sklearn fallback)"
            BEST_NAME, model = _load_sklearn_fallback()
else:
    # Not a DNN model; load the selected sklearn model.
    model = joblib.load(f"{MODEL_DIR}/best_model.pkl")
    print("✅ Loaded sklearn model")

print(f"✅ Loaded: {BEST_NAME}  |  Accuracy: {MODEL_META['best_accuracy']}%")
print(f"   Diseases : {MODEL_META['num_diseases']}")
print(f"   Symptoms : {MODEL_META['num_symptoms']}")

# ─── Translation Maps ─────────────────────────────────────────────────────────
TELUGU_MAP = {
    "జ్వరం":"high_fever","దగ్గు":"cough","తలనొప్పి":"headache","వాంతి":"vomiting",
    "విరేచనాలు":"diarrhoea","నీరసం":"fatigue","కడుపు నొప్పి":"stomach_pain",
    "శరీర నొప్పి":"muscle_pain","చలి":"chills","అలసట":"fatigue",
    "మూత్రవిసర్జన":"polyuria","దాహం":"excessive_thirst","దద్దుర్లు":"skin_rash",
    "దురద":"itching","శ్వాస":"breathlessness","ఛాతీ నొప్పి":"chest_pain",
    "కీళ్ళ నొప్పి":"joint_pain","వణుకు":"chills","చెమట":"sweating",
    "బరువు తగ్గడం":"weight_loss","ఆకలి లేకపోవడం":"loss_of_appetite",
    "పసుపు కళ్ళు":"yellowing_of_eyes","చీకటి మూత్రం":"dark_urine",
    "జలుబు":"runny_nose","వికారం":"nausea","నొప్పి":"muscle_pain",
    "నిద్రలేమి":"insomnia","అధిక రక్తపోటు":"high_blood_pressure",
    "గుండె దడ":"palpitations","వెన్నునొప్పి":"back_pain",
    "మైకం":"dizziness","రక్తస్రావం":"bleeding","దురద":"itching",
    "మూర్ఛ":"seizures","మత్తు":"altered_sensorium","శోషు":"fatigue",
}

HINDI_MAP = {
    "बुखार":"high_fever","खांसी":"cough","सिरदर्द":"headache","उल्टी":"vomiting",
    "दस्त":"diarrhoea","कमजोरी":"fatigue","पेट दर्द":"stomach_pain",
    "बदन दर्द":"muscle_pain","ठंड":"chills","थकान":"fatigue",
    "बार बार पेशाब":"polyuria","प्यास":"excessive_thirst","चकत्ते":"skin_rash",
    "खुजली":"itching","सांस की तकलीफ":"breathlessness","सीने में दर्द":"chest_pain",
    "जोड़ों का दर्द":"joint_pain","कंपकंपी":"chills","पसीना":"sweating",
    "वजन कम":"weight_loss","भूख नहीं":"loss_of_appetite",
    "पीली आंखें":"yellowing_of_eyes","गहरा पेशाब":"dark_urine",
    "नाक बहना":"runny_nose","मतली":"nausea","दर्द":"muscle_pain",
    "चक्कर":"dizziness","घबराहट":"anxiety","दिल की धड़कन":"palpitations",
    "पीठ दर्द":"back_pain","सूजन":"swollen_legs","कमर दर्द":"back_pain",
    "दौरा":"seizures","बेहोशी":"altered_sensorium","खून":"blood_in_sputum",
}

ENGLISH_MAP = {
    "fever":"high_fever","runny nose":"runny_nose","sore throat":"throat_irritation",
    "stomach pain":"stomach_pain","belly pain":"abdominal_pain","body pain":"muscle_pain",
    "body ache":"muscle_pain","joint pain":"joint_pain","chest pain":"chest_pain",
    "shortness of breath":"breathlessness","difficulty breathing":"breathlessness",
    "skin rash":"skin_rash","weight loss":"weight_loss","loss of appetite":"loss_of_appetite",
    "frequent urination":"polyuria","blurred vision":"blurred_and_distorted_vision",
    "yellow eyes":"yellowing_of_eyes","yellow skin":"yellowish_skin",
    "dark urine":"dark_urine","night sweats":"night_sweats","blood in cough":"blood_in_sputum",
    "swollen lymph nodes":"swelled_lymph_nodes","fast heartbeat":"fast_heart_rate",
    "spinning":"spinning_movements","unsteady":"unsteadiness",
    "pale skin":"pallor","frequent urination":"polyuria","blood in urine":"blood_in_urine",
    "burning urination":"burning_micturition","pus":"pus_filled_pimples",
    "blackheads":"blackheads","excess thirst":"excessive_thirst",
    "extreme thirst":"excessive_thirst","itchy skin":"itching",
    "eye redness":"redness_of_eyes","ear pain":"ear_pain","back pain":"back_pain",
    "neck pain":"neck_pain","knee pain":"knee_pain","hip pain":"hip_joint_pain",
    "cold hands":"cold_hands_and_feets","cold feet":"cold_hands_and_feets",
    "hair loss":"brittle_nails","brittle nails":"brittle_nails",
    "memory loss":"memory_loss","confusion":"confusion","seizure":"seizures",
    "numbness":"numbness","tingling":"tingling","bloating":"bloating",
    "constipation":"constipation","indigestion":"indigestion","heartburn":"acidity",
    "bloody stool":"bloody_stool","black stool":"black_stool",
}

def extract_symptoms(text):
    """Parse free-text symptoms (Telugu/Hindi/English) → feature names"""
    found = set()
    # Telugu
    for k, v in TELUGU_MAP.items():
        if k in text:
            if v in ALL_SYMPTOMS: found.add(v)
    # Hindi
    for k, v in HINDI_MAP.items():
        if k in text:
            if v in ALL_SYMPTOMS: found.add(v)
    # English phrases
    t_lower = text.lower()
    for phrase, feat in ENGLISH_MAP.items():
        if phrase in t_lower and feat in ALL_SYMPTOMS:
            found.add(feat)
    # Direct symptom name matching
    for sym in ALL_SYMPTOMS:
        readable = sym.replace("_", " ")
        if readable in t_lower or sym in t_lower:
            found.add(sym)
    return list(found)

def build_vector(symptoms_list):
    vec = np.array([1.0 if s in symptoms_list else 0.0 for s in ALL_SYMPTOMS], dtype=np.float32)
    return vec.reshape(1, -1)

def run_inference(vec):
    if BEST_TYPE == "dnn":
        vec_sc = scaler.transform(vec)
        proba  = model.predict(vec_sc, verbose=0)[0]
    else:
        proba = model.predict_proba(vec)[0]
    return proba

# ─── API Routes ───────────────────────────────────────────────────────────────

@app.route("/", methods=["GET"])
def root():
    return jsonify({
        "service": "SwasthyaVani ML Service",
        "version": "2.0",
        "best_model": BEST_NAME,
        "accuracy": f"{MODEL_META['best_accuracy']}%",
        "diseases": MODEL_META["num_diseases"],
        "symptoms": MODEL_META["num_symptoms"],
    })

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": BEST_NAME, "accuracy": MODEL_META["best_accuracy"]})

@app.route("/model_info", methods=["GET"])
def model_info():
    return jsonify(MODEL_META)

@app.route("/symptoms", methods=["GET"])
def get_symptoms():
    readable = [s.replace("_", " ") for s in ALL_SYMPTOMS]
    return jsonify({"symptoms": readable, "count": len(readable)})

@app.route("/diseases", methods=["GET"])
def get_diseases():
    diseases = []
    for name, meta in DISEASE_META.items():
        diseases.append({
            "name":     name,
            "severity": meta["severity"],
            "category": meta["category"],
            "icd10":    meta.get("icd10", ""),
            "telugu":   meta["telugu"],
            "hindi":    meta["hindi"],
        })
    return jsonify({"diseases": diseases, "count": len(diseases)})

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    if not data or "symptoms" not in data:
        return jsonify({"error": "Field 'symptoms' is required"}), 400

    raw = data["symptoms"]
    if not raw.strip():
        return jsonify({"error": "Empty symptoms text"}), 400

    matched = extract_symptoms(raw)

    if not matched:
        return jsonify({
            "predictions":       [],
            "matched_symptoms":  [],
            "message":           "No recognized symptoms. Please describe more clearly.",
            "emergency":         False,
        })

    vec   = build_vector(matched)
    proba = run_inference(vec)

    # Top 4 predictions
    top_idx = np.argsort(proba)[::-1][:4]
    predictions = []
    for idx in top_idx:
        if proba[idx] < 0.03:
            continue
        name = le.inverse_transform([idx])[0]
        meta = DISEASE_META.get(name, {})
        predictions.append({
            "disease":    name,
            "confidence": min(96, int(proba[idx] * 100) + 15),
            "severity":   meta.get("severity", "moderate"),
            "advice":     meta.get("advice", "Please consult a doctor."),
            "telugu":     meta.get("telugu", name),
            "hindi":      meta.get("hindi", name),
            "category":   meta.get("category", "General"),
            "icd10":      meta.get("icd10", ""),
            "emoji":      _emoji(meta.get("severity", "moderate")),
        })

    emergency = bool(predictions and predictions[0]["severity"] == "high")

    return jsonify({
        "predictions":      predictions,
        "matched_symptoms": [s.replace("_", " ") for s in matched],
        "emergency":        emergency,
        "model_used":       BEST_NAME,
        "model_accuracy":   MODEL_META["best_accuracy"],
    })

def _emoji(sev):
    return {"high": "🔴", "moderate": "🟡", "mild": "🟢"}.get(sev, "🩺")

@app.route("/feedback", methods=["POST"])
def feedback():
    """Receive user feedback for future retraining"""
    data = request.json
    # In production: save to MongoDB for active learning
    return jsonify({"message": "Feedback received. Thank you!", "data": data})

if __name__ == "__main__":
    if not os.path.exists(f"{MODEL_DIR}/label_encoder.pkl"):
        print("❌ Models not found. Run: python train_model.py first")
    else:
        print(f"\n🏥 SwasthyaVani ML Service running → http://localhost:5001")
        print(f"   Model: {BEST_NAME} | Accuracy: {MODEL_META['best_accuracy']}%\n")
        app.run(host="0.0.0.0", port=5001, debug=False)