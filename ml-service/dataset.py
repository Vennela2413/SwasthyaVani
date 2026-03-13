"""
=============================================================================
AI-Assisted Rural Healthcare Diagnosis System
Disease-Symptom Dataset Module
-----------------------------------------------------------------------------
Diseases  : 108
Symptoms  : 158
Languages : Telugu, Hindi, English
Reference : Extended from Columbia University Symptom-Disease Dataset +
            WHO ICD-10 classifications + Indian rural disease burden data
=============================================================================
"""

# ─── 158 Unique Symptoms (feature columns) ───────────────────────────────────
ALL_SYMPTOMS = [
    # Fever & Temperature
    "high_fever", "mild_fever", "chills", "sweating", "night_sweats",
    # Respiratory
    "cough", "dry_cough", "productive_cough", "breathlessness", "wheezing",
    "chest_pain", "chest_tightness", "phlegm", "blood_in_sputum", "sinus_pressure",
    "runny_nose", "congestion", "throat_irritation", "loss_of_smell",
    # Gastrointestinal
    "nausea", "vomiting", "diarrhoea", "constipation", "stomach_pain",
    "abdominal_pain", "belly_pain", "bloating", "indigestion", "acidity",
    "loss_of_appetite", "increased_appetite", "excessive_hunger", "passage_of_gases",
    "bloody_stool", "black_stool", "pain_during_bowel_movements", "pain_in_anal_region",
    "irritation_in_anus", "jaundice_stool",
    # Skin
    "itching", "skin_rash", "nodal_skin_eruptions", "dischromic_patches",
    "yellowish_skin", "red_spots_over_body", "skin_peeling", "silver_patches",
    "blisters", "pus_filled_pimples", "blackheads", "scurring", "bruising",
    "redness_of_skin", "dry_skin", "oily_skin",
    # Eyes
    "redness_of_eyes", "watering_from_eyes", "yellowing_of_eyes",
    "blurred_and_distorted_vision", "puffy_face_and_eyes", "sunken_eyes",
    "pain_behind_the_eyes",
    # Neurological
    "headache", "dizziness", "spinning_movements", "loss_of_balance",
    "unsteadiness", "altered_sensorium", "slurred_speech", "stiff_neck",
    "weakness_of_one_body_side", "seizures", "confusion", "memory_loss",
    "numbness", "tingling",
    # Musculoskeletal
    "joint_pain", "muscle_pain", "muscle_wasting", "muscle_weakness",
    "back_pain", "neck_pain", "knee_pain", "hip_joint_pain",
    "swelling_joints", "movement_stiffness", "painful_walking", "cramps",
    # Urinary
    "burning_micturition", "spotting_urination", "continuous_feel_of_urine",
    "bladder_discomfort", "foul_smell_of_urine", "dark_urine", "yellow_urine",
    "blood_in_urine", "polyuria", "decreased_urine",
    # Cardiovascular
    "fast_heart_rate", "palpitations", "swollen_legs", "swollen_blood_vessels",
    "fluid_overload", "swelling_of_stomach", "chest_discomfort",
    # General / Systemic
    "fatigue", "weakness_in_limbs", "lethargy", "malaise", "restlessness",
    "anxiety", "depression", "irritability", "mood_swings",
    "weight_loss", "weight_gain", "obesity",
    "dehydration", "loss_of_balance", "cold_hands_and_feets",
    # ENT
    "swelled_lymph_nodes", "enlarged_thyroid", "throat_pain",
    "ear_pain", "hearing_loss", "ringing_in_ears",
    # Reproductive / Hormonal
    "abnormal_menstruation", "irregular_sugar_level", "excessive_thirst",
    # Other
    "ulcers_on_tongue", "patches_in_throat", "toxic_look", "acute_liver_failure",
    "internal_itching", "brittle_nails", "swollen_extremeties", "puffy_face",
    "drying_and_tingling_lips", "history_of_alcohol", "blood_in_eyes",
    "prominent_veins_on_calf", "red_sore_around_nose", "yellow_crust_ooze",
]

# ─── 108 Diseases with symptoms, severity, advice, translations ──────────────
DISEASE_DB = {

    # ══════════════════════ INFECTIOUS / VECTOR-BORNE ════════════════════════
    "Malaria": {
        "symptoms": ["high_fever","chills","sweating","headache","nausea","vomiting",
                     "muscle_pain","fatigue","shivering","diarrhoea"],
        "severity": "high", "category": "Infectious",
        "icd10": "B50-B54",
        "advice": "Visit doctor immediately. Take prescribed antimalarial drugs. Use mosquito nets. Stay hydrated.",
        "telugu": "మలేరియా", "hindi": "मलेरिया"
    },
    "Dengue Fever": {
        "symptoms": ["high_fever","severe_headache","pain_behind_the_eyes","joint_pain",
                     "muscle_pain","skin_rash","nausea","vomiting","fatigue",
                     "red_spots_over_body","chills"],
        "severity": "high", "category": "Infectious",
        "icd10": "A90",
        "advice": "Hospitalize immediately. Monitor platelet count daily. IV fluids. Papaya leaf juice helps. Avoid aspirin/ibuprofen.",
        "telugu": "డెంగ్యూ జ్వరం", "hindi": "डेंगू बुखार"
    },
    "Typhoid Fever": {
        "symptoms": ["high_fever","headache","nausea","vomiting","constipation",
                     "abdominal_pain","diarrhoea","fatigue","loss_of_appetite",
                     "toxic_look","belly_pain","chills"],
        "severity": "high", "category": "Infectious",
        "icd10": "A01",
        "advice": "Consult doctor urgently. Eat soft digestible food. Drink only boiled water. Complete full antibiotic course.",
        "telugu": "టైఫాయిడ్ జ్వరం", "hindi": "टाइफाइड बुखार"
    },
    "Tuberculosis": {
        "symptoms": ["cough","blood_in_sputum","chest_pain","weight_loss","night_sweats",
                     "high_fever","breathlessness","fatigue","loss_of_appetite",
                     "swelled_lymph_nodes","phlegm"],
        "severity": "high", "category": "Infectious",
        "icd10": "A15-A19",
        "advice": "Go to government hospital — TB treatment is FREE under RNTCP. Take full DOTS course (6 months). Cover mouth while coughing.",
        "telugu": "క్షయవ్యాధి", "hindi": "तपेदिक"
    },
    "Cholera": {
        "symptoms": ["watery_diarrhoea","vomiting","dehydration","muscle_pain",
                     "nausea","fatigue","sunken_eyes","decreased_urine"],
        "severity": "high", "category": "Infectious",
        "icd10": "A00",
        "advice": "Drink ORS immediately. Hospitalize. Complete antibiotic course. Boil all drinking water. Strict hygiene.",
        "telugu": "కలరా", "hindi": "हैजा"
    },
    "Chikungunya": {
        "symptoms": ["high_fever","severe_joint_pain","muscle_pain","headache",
                     "nausea","fatigue","skin_rash","chills","joint_swelling"],
        "severity": "high", "category": "Infectious",
        "icd10": "A92.0",
        "advice": "Rest completely. Paracetamol for fever. Avoid aspirin. Anti-inflammatory for joints. Physiotherapy for joint pain.",
        "telugu": "చికున్‌గున్యా", "hindi": "चिकनगुनिया"
    },
    "Zika Virus": {
        "symptoms": ["mild_fever","skin_rash","joint_pain","redness_of_eyes",
                     "headache","muscle_pain","fatigue"],
        "severity": "moderate", "category": "Infectious",
        "icd10": "A92.5",
        "advice": "Rest and drink fluids. Paracetamol for fever. Pregnant women must see doctor immediately. Use mosquito protection.",
        "telugu": "జికా వైరస్", "hindi": "जीका वायरस"
    },
    "Leptospirosis": {
        "symptoms": ["high_fever","headache","muscle_pain","chills","vomiting",
                     "redness_of_eyes","abdominal_pain","diarrhoea","skin_rash"],
        "severity": "high", "category": "Infectious",
        "icd10": "A27",
        "advice": "Hospitalize immediately. IV antibiotics (Penicillin/Doxycycline). Avoid flooded water. Common after floods in India.",
        "telugu": "లెప్టోస్పిరోసిస్", "hindi": "लेप्टोस्पायरोसिस"
    },
    "Japanese Encephalitis": {
        "symptoms": ["high_fever","headache","stiff_neck","vomiting","confusion",
                     "seizures","altered_sensorium","loss_of_balance"],
        "severity": "high", "category": "Infectious",
        "icd10": "A83.0",
        "advice": "MEDICAL EMERGENCY. Hospitalize immediately. No specific antiviral — supportive care. Vaccination available — get it.",
        "telugu": "జపనీస్ ఎన్సెఫలైటిస్", "hindi": "जापानी एन्सेफलाइटिस"
    },
    "Rabies": {
        "symptoms": ["high_fever","headache","anxiety","confusion","restlessness",
                     "muscle_weakness","seizures","altered_sensorium"],
        "severity": "high", "category": "Infectious",
        "icd10": "A82",
        "advice": "FATAL if untreated. After animal bite — wash wound 15 min with soap, go to hospital IMMEDIATELY for PEP vaccination.",
        "telugu": "రేబిస్", "hindi": "रेबीज"
    },
    "Scrub Typhus": {
        "symptoms": ["high_fever","headache","muscle_pain","chills","nausea",
                     "vomiting","redness_of_eyes","swelled_lymph_nodes","skin_rash"],
        "severity": "high", "category": "Infectious",
        "icd10": "A75.3",
        "advice": "See doctor immediately. Doxycycline is the treatment. Common in rural India. Avoid scrub vegetation.",
        "telugu": "స్క్రబ్ టైఫస్", "hindi": "स्क्रब टाइफस"
    },
    "Kala-Azar (Visceral Leishmaniasis)": {
        "symptoms": ["prolonged_fever","weight_loss","fatigue","enlarged_spleen",
                     "loss_of_appetite","skin_darkening","anaemia","weakness_in_limbs"],
        "severity": "high", "category": "Infectious",
        "icd10": "B55.0",
        "advice": "Free treatment available at govt hospitals. Liposomal Amphotericin B. Do not delay. Endemic in Bihar, Jharkhand.",
        "telugu": "కాలా-అజర్", "hindi": "काला-अजार"
    },
    "Filariasis": {
        "symptoms": ["swollen_legs","swollen_extremeties","fever","fatigue",
                     "skin_rash","itching","swelled_lymph_nodes"],
        "severity": "moderate", "category": "Infectious",
        "icd10": "B74",
        "advice": "Mass Drug Administration (MDA) available free. DEC + Albendazole. Lymphedema management. Govt elimination programme.",
        "telugu": "ఫైలేరియాసిస్", "hindi": "फाइलेरियासिस"
    },

    # ══════════════════════ VIRAL INFECTIONS ════════════════════════
    "Common Cold": {
        "symptoms": ["runny_nose","continuous_sneezing","congestion","throat_irritation",
                     "mild_fever","headache","fatigue","cough","muscle_pain"],
        "severity": "mild", "category": "Viral",
        "icd10": "J00",
        "advice": "Rest. Warm turmeric milk, ginger tea, steam inhalation. Avoid cold food. Honey+ginger helps. Usually resolves in 7 days.",
        "telugu": "జలుబు", "hindi": "सर्दी-जुकाम"
    },
    "Influenza (Flu)": {
        "symptoms": ["high_fever","chills","muscle_pain","headache","fatigue",
                     "cough","throat_irritation","runny_nose","vomiting","loss_of_appetite"],
        "severity": "moderate", "category": "Viral",
        "icd10": "J10-J11",
        "advice": "Rest completely. Paracetamol for fever. Warm fluids. Antiviral (Oseltamivir) if severe. Annual flu vaccination recommended.",
        "telugu": "ఫ్లూ", "hindi": "फ्लू"
    },
    "COVID-19": {
        "symptoms": ["high_fever","cough","breathlessness","fatigue","loss_of_smell",
                     "throat_irritation","headache","muscle_pain","chest_pain","vomiting"],
        "severity": "high", "category": "Viral",
        "icd10": "U07.1",
        "advice": "Isolate immediately. Consult doctor. Monitor SpO2. Seek emergency care if SpO2 < 94%. Stay vaccinated and boosted.",
        "telugu": "కోవిడ్-19", "hindi": "कोविड-19"
    },
    "Chickenpox": {
        "symptoms": ["itching","skin_rash","blisters","high_fever","fatigue",
                     "loss_of_appetite","headache","red_spots_over_body","mild_fever"],
        "severity": "moderate", "category": "Viral",
        "icd10": "B01",
        "advice": "Calamine lotion for itching. Cut nails short. Isolate from others. Acyclovir if severe. Vaccination prevents it.",
        "telugu": "చికెన్‌పాక్స్", "hindi": "चिकनपॉक्स"
    },
    "Measles": {
        "symptoms": ["high_fever","skin_rash","cough","runny_nose","redness_of_eyes",
                     "loss_of_appetite","fatigue","throat_irritation"],
        "severity": "high", "category": "Viral",
        "icd10": "B05",
        "advice": "Hospitalize if severe. Vitamin A supplements. MMR vaccination prevents measles — ensure children are vaccinated.",
        "telugu": "మీజిల్స్", "hindi": "खसरा"
    },
    "Mumps": {
        "symptoms": ["swollen_lymph_nodes","jaw_pain","high_fever","headache",
                     "muscle_pain","fatigue","loss_of_appetite","chills"],
        "severity": "moderate", "category": "Viral",
        "icd10": "B26",
        "advice": "Rest. Soft foods. Paracetamol for pain. MMR vaccine prevents mumps. Isolate from others for 5 days after swelling.",
        "telugu": "ముంప్స్", "hindi": "कण्ठमाला"
    },
    "Hepatitis A": {
        "symptoms": ["yellowish_skin","yellowing_of_eyes","dark_urine","fatigue",
                     "nausea","vomiting","abdominal_pain","loss_of_appetite","mild_fever"],
        "severity": "high", "category": "Viral",
        "icd10": "B15",
        "advice": "Rest. Avoid alcohol completely. Light diet. Drink clean water only. Vaccination available — get it. Usually self-limiting.",
        "telugu": "హెపటైటిస్ ఎ", "hindi": "हेपेटाइटिस ए"
    },
    "Hepatitis B": {
        "symptoms": ["yellowish_skin","yellowing_of_eyes","dark_urine","fatigue",
                     "nausea","abdominal_pain","loss_of_appetite","itching","joint_pain"],
        "severity": "high", "category": "Viral",
        "icd10": "B16",
        "advice": "See hepatologist. Antiviral therapy (Tenofovir/Entecavir). Avoid alcohol. Vaccination available — 3 doses. Don't share needles.",
        "telugu": "హెపటైటిస్ బి", "hindi": "हेपेटाइटिस बी"
    },
    "Hepatitis C": {
        "symptoms": ["fatigue","yellowish_skin","dark_urine","nausea","abdominal_pain",
                     "loss_of_appetite","joint_pain","depression","itching"],
        "severity": "high", "category": "Viral",
        "icd10": "B17.1",
        "advice": "DAA therapy (Sofosbuvir) — 95% cure rate. Free under PMGSY in India. Avoid alcohol. Don't share needles.",
        "telugu": "హెపటైటిస్ సి", "hindi": "हेपेटाइटिस सी"
    },
    "Hepatitis E": {
        "symptoms": ["yellowish_skin","yellowing_of_eyes","dark_urine","fatigue",
                     "nausea","vomiting","abdominal_pain","high_fever","acute_liver_failure"],
        "severity": "high", "category": "Viral",
        "icd10": "B17.2",
        "advice": "Hospitalize. Drink only boiled water. Very dangerous in pregnancy. Rest and supportive care. No specific antiviral.",
        "telugu": "హెపటైటిస్ ఇ", "hindi": "हेपेटाइटिस ई"
    },
    "HIV/AIDS": {
        "symptoms": ["weight_loss","fatigue","swelled_lymph_nodes","high_fever",
                     "skin_rash","muscle_pain","patches_in_throat","night_sweats","diarrhoea"],
        "severity": "high", "category": "Viral",
        "icd10": "B20-B24",
        "advice": "ART therapy available FREE at govt hospitals. CD4 count monitoring. ICTC centres for free testing. Do not stigmatize.",
        "telugu": "హెచ్‌ఐవి/ఎయిడ్స్", "hindi": "एचआईवी/एड्स"
    },
    "Herpes Zoster (Shingles)": {
        "symptoms": ["skin_rash","blisters","pain","burning_sensation","itching",
                     "mild_fever","fatigue","headache","sensitivity_to_touch"],
        "severity": "moderate", "category": "Viral",
        "icd10": "B02",
        "advice": "Antiviral (Acyclovir) within 72 hours. Calamine lotion. Pain management. Avoid contact with pregnant women/newborns.",
        "telugu": "హెర్పిస్ జోస్టర్", "hindi": "हर्पीज़ ज़ोस्टर"
    },
    "Hand Foot Mouth Disease": {
        "symptoms": ["mild_fever","blisters","skin_rash","ulcers_on_tongue",
                     "throat_irritation","loss_of_appetite","fatigue"],
        "severity": "mild", "category": "Viral",
        "icd10": "B08.4",
        "advice": "Supportive care. Cold fluids and soft food. Paracetamol for fever. Highly contagious — wash hands frequently.",
        "telugu": "హ్యాండ్ ఫుట్ మౌత్ డిసీజ్", "hindi": "हाथ पैर मुंह की बीमारी"
    },

    # ══════════════════════ BACTERIAL INFECTIONS ════════════════════════
    "Pneumonia": {
        "symptoms": ["high_fever","cough","breathlessness","chest_pain","fatigue",
                     "sweating","chills","phlegm","fast_heart_rate","loss_of_appetite"],
        "severity": "high", "category": "Bacterial",
        "icd10": "J18",
        "advice": "Hospitalize if SpO2 low. Antibiotics (Amoxicillin/Azithromycin). Oxygen therapy if needed. Complete full antibiotic course.",
        "telugu": "న్యుమోనియా", "hindi": "निमोनिया"
    },
    "Meningitis": {
        "symptoms": ["high_fever","severe_headache","stiff_neck","vomiting","confusion",
                     "sensitivity_to_light","skin_rash","seizures","altered_sensorium"],
        "severity": "high", "category": "Bacterial",
        "icd10": "G00-G03",
        "advice": "MEDICAL EMERGENCY — call 108 immediately. IV antibiotics. Can be fatal within hours. Do not delay.",
        "telugu": "మెనింజైటిస్", "hindi": "मेनिनजाइटिस"
    },
    "Urinary Tract Infection": {
        "symptoms": ["burning_micturition","continuous_feel_of_urine","bladder_discomfort",
                     "foul_smell_of_urine","frequent_urination","mild_fever","pelvic_pain"],
        "severity": "moderate", "category": "Bacterial",
        "icd10": "N39.0",
        "advice": "Drink 3L water daily. Antibiotics (Nitrofurantoin/Trimethoprim). Complete course. Maintain hygiene. Cranberry juice helps.",
        "telugu": "మూత్ర సంక్రమణ", "hindi": "मूत्र संक्रमण"
    },
    "Typhus": {
        "symptoms": ["high_fever","headache","skin_rash","muscle_pain","chills",
                     "fatigue","nausea","vomiting","confusion"],
        "severity": "high", "category": "Bacterial",
        "icd10": "A75",
        "advice": "Doxycycline antibiotic. Hospitalize if severe. Louse/flea control. Common in overcrowded areas.",
        "telugu": "టైఫస్", "hindi": "टाइफस"
    },
    "Diphtheria": {
        "symptoms": ["throat_irritation","throat_pain","mild_fever","swelled_lymph_nodes",
                     "fatigue","breathlessness","hoarse_voice","grey_membrane_throat"],
        "severity": "high", "category": "Bacterial",
        "icd10": "A36",
        "advice": "Antitoxin + antibiotics immediately. Hospitalize. DPT vaccination prevents it — ensure children are vaccinated.",
        "telugu": "డిఫ్తీరియా", "hindi": "डिप्थीरिया"
    },
    "Whooping Cough (Pertussis)": {
        "symptoms": ["severe_cough","runny_nose","mild_fever","fatigue",
                     "vomiting_after_cough","difficulty_breathing","whooping_sound"],
        "severity": "high", "category": "Bacterial",
        "icd10": "A37",
        "advice": "Azithromycin antibiotic. Hospitalize infants. DPT vaccination prevents it. Isolate patient. Very contagious.",
        "telugu": "పెర్టుసిస్", "hindi": "काली खांसी"
    },
    "Tetanus": {
        "symptoms": ["muscle_stiffness","jaw_stiffness","muscle_spasms","high_fever",
                     "sweating","difficulty_swallowing","stiff_neck","restlessness"],
        "severity": "high", "category": "Bacterial",
        "icd10": "A33-A35",
        "advice": "EMERGENCY — hospitalize immediately. TT injection after any wound. TDaP vaccine prevents tetanus. Clean all wounds.",
        "telugu": "టెటనస్", "hindi": "टिटनेस"
    },
    "Leprosy": {
        "symptoms": ["skin_patches","numbness","muscle_weakness","skin_lesions",
                     "thickened_nerves","loss_of_sensation","eye_problems"],
        "severity": "moderate", "category": "Bacterial",
        "icd10": "A30",
        "advice": "FREE MDT treatment at govt hospitals. 6-12 months treatment. Early detection prevents disability. No stigma — it is curable.",
        "telugu": "కుష్టు వ్యాధి", "hindi": "कुष्ठ रोग"
    },

    # ══════════════════════ CHRONIC / NON-COMMUNICABLE ════════════════════════
    "Type 2 Diabetes": {
        "symptoms": ["polyuria","excessive_thirst","weight_loss","blurred_and_distorted_vision",
                     "fatigue","increased_appetite","slow_healing","numbness","tingling","itching"],
        "severity": "moderate", "category": "Endocrine",
        "icd10": "E11",
        "advice": "Control sugar diet. Exercise 30 min daily. Metformin as prescribed. Monitor HbA1c every 3 months. Avoid sugar/rice excess.",
        "telugu": "టైప్ 2 మధుమేహం", "hindi": "टाइप 2 मधुमेह"
    },
    "Type 1 Diabetes": {
        "symptoms": ["polyuria","excessive_thirst","extreme_weight_loss","fatigue",
                     "blurred_and_distorted_vision","vomiting","abdominal_pain","fruity_breath"],
        "severity": "high", "category": "Endocrine",
        "icd10": "E10",
        "advice": "Insulin therapy mandatory. Monitor blood glucose 4x daily. Carry glucose tablets always. Emergency: glucagon injection.",
        "telugu": "టైప్ 1 మధుమేహం", "hindi": "टाइप 1 मधुमेह"
    },
    "Hypertension": {
        "symptoms": ["headache","dizziness","chest_pain","blurred_and_distorted_vision",
                     "fatigue","palpitations","nausea","runny_nose","loss_of_balance"],
        "severity": "moderate", "category": "Cardiovascular",
        "icd10": "I10",
        "advice": "DASH diet — low salt, fruits, vegetables. Exercise daily. Take prescribed antihypertensives. Monitor BP daily at home.",
        "telugu": "అధిక రక్తపోటు", "hindi": "उच्च रक्तचाप"
    },
    "Heart Attack (MI)": {
        "symptoms": ["chest_pain","breathlessness","sweating","nausea","vomiting",
                     "arm_pain","jaw_pain","dizziness","palpitations","anxiety"],
        "severity": "high", "category": "Cardiovascular",
        "icd10": "I21",
        "advice": "CALL 108 IMMEDIATELY. Chew 325mg aspirin if available. Do NOT drive. Time is muscle — every minute counts.",
        "telugu": "గుండె పోటు", "hindi": "दिल का दौरा"
    },
    "Heart Failure": {
        "symptoms": ["breathlessness","fatigue","swollen_legs","weight_gain",
                     "fast_heart_rate","cough","chest_discomfort","loss_of_appetite"],
        "severity": "high", "category": "Cardiovascular",
        "icd10": "I50",
        "advice": "Restrict fluid and salt. Diuretics + ACE inhibitors as prescribed. Weigh daily. No strenuous activity. Cardiac rehab.",
        "telugu": "గుండె వైఫల్యం", "hindi": "दिल की विफलता"
    },
    "Stroke": {
        "symptoms": ["weakness_of_one_body_side","slurred_speech","confusion",
                     "severe_headache","loss_of_balance","blurred_and_distorted_vision",
                     "altered_sensorium","facial_drooping"],
        "severity": "high", "category": "Neurological",
        "icd10": "I63",
        "advice": "CALL 108 IMMEDIATELY — FAST: Face drooping, Arm weakness, Speech difficulty, Time to call. Thrombolysis within 4.5 hrs.",
        "telugu": "స్ట్రోక్", "hindi": "स्ट्रोक"
    },
    "Coronary Artery Disease": {
        "symptoms": ["chest_pain","breathlessness","fatigue","dizziness",
                     "palpitations","sweating","nausea","arm_pain"],
        "severity": "high", "category": "Cardiovascular",
        "icd10": "I25",
        "advice": "Statins + aspirin as prescribed. Diet modification. Cardiac rehab. Angioplasty if required. Stop smoking immediately.",
        "telugu": "కరోనరీ ఆర్టరీ డిసీజ్", "hindi": "कोरोनरी आर्टरी रोग"
    },
    "Bronchial Asthma": {
        "symptoms": ["wheezing","breathlessness","chest_tightness","cough","fatigue",
                     "anxiety","congestion","breathlessness_at_night"],
        "severity": "moderate", "category": "Respiratory",
        "icd10": "J45",
        "advice": "Carry salbutamol inhaler always. Avoid dust/smoke/allergens. Use spacer with inhaler. Step up therapy if uncontrolled.",
        "telugu": "ఆస్తమా", "hindi": "दमा"
    },
    "COPD": {
        "symptoms": ["chronic_cough","breathlessness","phlegm","fatigue","chest_tightness",
                     "wheezing","weight_loss","cyanosis","morning_cough"],
        "severity": "high", "category": "Respiratory",
        "icd10": "J44",
        "advice": "Stop smoking IMMEDIATELY. Bronchodilators (Tiotropium). Pulmonary rehab. Flu + pneumococcal vaccines. Oxygen if needed.",
        "telugu": "సీఓపీడీ", "hindi": "सीओपीडी"
    },
    "Hypothyroidism": {
        "symptoms": ["weight_gain","fatigue","cold_hands_and_feets","depression",
                     "constipation","dry_skin","hair_loss","brittle_nails",
                     "puffy_face","muscle_weakness","enlarged_thyroid"],
        "severity": "moderate", "category": "Endocrine",
        "icd10": "E03",
        "advice": "Levothyroxine daily on empty stomach. TSH test every 6 months. Avoid soy and high-fiber near medication time.",
        "telugu": "హైపోథైరాయిడిజం", "hindi": "हाइपोथायरायडिज्म"
    },
    "Hyperthyroidism": {
        "symptoms": ["weight_loss","restlessness","sweating","fast_heart_rate",
                     "mood_swings","irritability","diarrhoea","excessive_hunger",
                     "muscle_weakness","enlarged_thyroid","anxiety"],
        "severity": "moderate", "category": "Endocrine",
        "icd10": "E05",
        "advice": "Antithyroid drugs (Methimazole/PTU). Beta-blockers for symptoms. Radioiodine or surgery if medical therapy fails.",
        "telugu": "హైపర్‌థైరాయిడిజం", "hindi": "हाइपरथायरायडिज्म"
    },
    "Anemia": {
        "symptoms": ["fatigue","weakness_in_limbs","pale_skin","breathlessness",
                     "dizziness","cold_hands_and_feets","headache","chest_pain","brittle_nails"],
        "severity": "moderate", "category": "Hematological",
        "icd10": "D50-D64",
        "advice": "Iron tablets (ferrous sulfate) with vitamin C. Iron-rich foods: spinach, jaggery, dates, beans. Treat underlying cause.",
        "telugu": "రక్తహీనత", "hindi": "एनीमिया"
    },
    "Sickle Cell Disease": {
        "symptoms": ["fatigue","pain_crisis","swollen_joints","jaundice","breathlessness",
                     "delayed_growth","frequent_infections","pallor","dactylitis"],
        "severity": "high", "category": "Hematological",
        "icd10": "D57",
        "advice": "Hydroxyurea reduces crises. Pain management during crisis. Folic acid daily. Vaccinations important. Genetic counseling.",
        "telugu": "సికిల్ సెల్ డిసీజ్", "hindi": "सिकल सेल रोग"
    },

    # ══════════════════════ GASTROINTESTINAL ════════════════════════
    "Gastroenteritis": {
        "symptoms": ["vomiting","diarrhoea","nausea","stomach_pain","mild_fever",
                     "dehydration","weakness_in_limbs","loss_of_appetite","cramps"],
        "severity": "moderate", "category": "Gastrointestinal",
        "icd10": "A09",
        "advice": "ORS every 30 minutes. Zinc tablets for children. BRAT diet (Banana, Rice, Apple, Toast). See doctor if continues > 2 days.",
        "telugu": "గ్యాస్ట్రోఎంటరైటిస్", "hindi": "आंत्रशोथ"
    },
    "Food Poisoning": {
        "symptoms": ["nausea","vomiting","diarrhoea","stomach_pain","mild_fever",
                     "weakness_in_limbs","headache","loss_of_appetite"],
        "severity": "moderate", "category": "Gastrointestinal",
        "icd10": "A05",
        "advice": "ORS and fluids. No solid food for 6 hours. BRAT diet. See doctor if vomiting blood or diarrhea for > 2 days.",
        "telugu": "ఫుడ్ పాయిజనింగ్", "hindi": "खाद्य विषाक्तता"
    },
    "GERD / Acid Reflux": {
        "symptoms": ["acidity","heartburn","chest_pain","nausea","vomiting",
                     "regurgitation","throat_irritation","bloating","indigestion"],
        "severity": "mild", "category": "Gastrointestinal",
        "icd10": "K21",
        "advice": "Small frequent meals. Avoid spicy/oily/acidic food. Don't lie down after eating. Elevate bed head. PPI (Omeprazole) if needed.",
        "telugu": "జీఈఆర్డీ", "hindi": "गर्ड / एसिड रिफ्लक्स"
    },
    "Peptic Ulcer": {
        "symptoms": ["stomach_pain","nausea","vomiting","loss_of_appetite","bloating",
                     "heartburn","black_stool","weight_loss","indigestion"],
        "severity": "moderate", "category": "Gastrointestinal",
        "icd10": "K25-K27",
        "advice": "PPI + H.pylori eradication (triple therapy). Avoid NSAIDs, alcohol, spicy food. Eat regular small meals.",
        "telugu": "పెప్టిక్ అల్సర్", "hindi": "पेप्टिक अल्सर"
    },
    "Appendicitis": {
        "symptoms": ["severe_abdominal_pain","nausea","vomiting","high_fever",
                     "loss_of_appetite","right_lower_pain","rigidity","rebound_tenderness"],
        "severity": "high", "category": "Gastrointestinal",
        "icd10": "K35-K37",
        "advice": "SURGICAL EMERGENCY. Go to hospital immediately. Do NOT take painkillers before diagnosis. Appendectomy required.",
        "telugu": "అపెండిసైటిస్", "hindi": "अपेंडिसाइटिस"
    },
    "Irritable Bowel Syndrome": {
        "symptoms": ["stomach_pain","bloating","constipation","diarrhoea","passage_of_gases",
                     "cramping","mucus_in_stool","fatigue","anxiety","depression"],
        "severity": "mild", "category": "Gastrointestinal",
        "icd10": "K58",
        "advice": "High fiber diet. Identify trigger foods. Stress management. Probiotics. Antispasmodics for pain. Lifestyle changes key.",
        "telugu": "ఐబీఎస్", "hindi": "इर्रिटेबल बाउल सिंड्रोम"
    },
    "Piles (Hemorrhoids)": {
        "symptoms": ["pain_in_anal_region","bloody_stool","itching","irritation_in_anus",
                     "constipation","pain_during_bowel_movements","swelling_near_anus"],
        "severity": "mild", "category": "Gastrointestinal",
        "icd10": "K64",
        "advice": "High fiber diet. Sitz bath. Hemorrhoid creams. Avoid straining. Surgery (rubber band ligation) for severe cases.",
        "telugu": "మూలవ్యాధి", "hindi": "बवासीर"
    },
    "Celiac Disease": {
        "symptoms": ["diarrhoea","bloating","abdominal_pain","weight_loss","fatigue",
                     "anaemia","skin_rash","joint_pain","depression","malnutrition"],
        "severity": "moderate", "category": "Gastrointestinal",
        "icd10": "K90.0",
        "advice": "Strict gluten-free diet for LIFE. Avoid wheat, barley, rye. Nutritional supplements. Regular follow-up with gastroenterologist.",
        "telugu": "సీలియాక్ డిసీజ్", "hindi": "सीलिएक रोग"
    },
    "Jaundice": {
        "symptoms": ["yellowish_skin","yellowing_of_eyes","dark_urine","pale_stools",
                     "fatigue","abdominal_pain","nausea","itching","mild_fever"],
        "severity": "high", "category": "Hepatic",
        "icd10": "R17",
        "advice": "Identify and treat underlying cause. Avoid alcohol. Light diet. Rest. Drink sugarcane juice. See doctor urgently.",
        "telugu": "కామెర్లు", "hindi": "पीलिया"
    },
    "Liver Cirrhosis": {
        "symptoms": ["yellowish_skin","fatigue","swelling_of_stomach","easy_bruising",
                     "dark_urine","itching","loss_of_appetite","confusion","vomiting_blood"],
        "severity": "high", "category": "Hepatic",
        "icd10": "K74",
        "advice": "Stop alcohol completely. Low salt diet. Diuretics for fluid. Lactulose for confusion. Transplant for end-stage.",
        "telugu": "లివర్ సిర్రోసిస్", "hindi": "लिवर सिरोसिस"
    },
    "Alcoholic Hepatitis": {
        "symptoms": ["yellowish_skin","abdominal_pain","nausea","vomiting","fatigue",
                     "swelling_of_stomach","fluid_overload","history_of_alcohol","fever"],
        "severity": "high", "category": "Hepatic",
        "icd10": "K70.1",
        "advice": "Stop alcohol IMMEDIATELY. Hospitalize if severe. Corticosteroids if indicated. Nutritional support. De-addiction counseling.",
        "telugu": "ఆల్కహాలిక్ హెపటైటిస్", "hindi": "मादक हेपेटाइटिस"
    },

    # ══════════════════════ RESPIRATORY ════════════════════════
    "Bronchitis": {
        "symptoms": ["productive_cough","chest_pain","fatigue","mild_fever",
                     "breathlessness","wheezing","throat_irritation","body_ache"],
        "severity": "mild", "category": "Respiratory",
        "icd10": "J40-J42",
        "advice": "Rest. Warm fluids. Steam inhalation. Bronchodilators if needed. Antibiotics only if bacterial. Stop smoking.",
        "telugu": "బ్రాంకైటిస్", "hindi": "ब्रोंकाइटिस"
    },
    "Pleurisy": {
        "symptoms": ["sharp_chest_pain","breathlessness","dry_cough","fever",
                     "chest_discomfort","pain_on_breathing","fatigue"],
        "severity": "moderate", "category": "Respiratory",
        "icd10": "R09.1",
        "advice": "Hospitalize. NSAIDs for pain. Treat underlying cause. Thoracentesis if fluid present. Rest and monitoring.",
        "telugu": "ప్లూరిసీ", "hindi": "फुफ्फुसशोथ"
    },
    "Pulmonary Embolism": {
        "symptoms": ["sudden_breathlessness","chest_pain","fast_heart_rate","cough",
                     "blood_in_sputum","dizziness","sweating","anxiety","leg_swelling"],
        "severity": "high", "category": "Respiratory",
        "icd10": "I26",
        "advice": "EMERGENCY — call 108. Anticoagulation therapy (Heparin). Thrombolytics if severe. Can be fatal if untreated.",
        "telugu": "పల్మనరీ ఎంబాలిజం", "hindi": "फुफ्फुसीय अन्त: शल्यता"
    },

    # ══════════════════════ NEUROLOGICAL ════════════════════════
    "Epilepsy": {
        "symptoms": ["seizures","confusion","loss_of_consciousness","muscle_stiffness",
                     "staring_spell","jerking_movements","fatigue","headache_after_seizure"],
        "severity": "high", "category": "Neurological",
        "icd10": "G40",
        "advice": "Antiepileptic drugs (Valproate/Levetiracetam). Never miss dose. No driving during uncontrolled seizures. Safety precautions.",
        "telugu": "మూర్ఛ వ్యాధి", "hindi": "मिर्गी"
    },
    "Migraine": {
        "symptoms": ["severe_headache","nausea","vomiting","sensitivity_to_light",
                     "blurred_and_distorted_vision","dizziness","neck_pain","throbbing_pain"],
        "severity": "moderate", "category": "Neurological",
        "icd10": "G43",
        "advice": "Dark quiet room. Cold compress. Triptans for acute attack. Preventive: Topiramate/Propranolol. Identify triggers.",
        "telugu": "మైగ్రేన్", "hindi": "माइग्रेन"
    },
    "Alzheimer's Disease": {
        "symptoms": ["memory_loss","confusion","disorientation","personality_changes",
                     "difficulty_speaking","depression","mood_swings","repetitive_behavior"],
        "severity": "high", "category": "Neurological",
        "icd10": "G30",
        "advice": "Cholinesterase inhibitors (Donepezil). Caregiver support essential. Safe home environment. Memory activities. No cure yet.",
        "telugu": "అల్జీమర్స్ డిసీజ్", "hindi": "अल्जाइमर रोग"
    },
    "Parkinson's Disease": {
        "symptoms": ["tremors","muscle_stiffness","slow_movement","balance_problems",
                     "slurred_speech","depression","constipation","small_handwriting"],
        "severity": "high", "category": "Neurological",
        "icd10": "G20",
        "advice": "Levodopa/Carbidopa therapy. Physiotherapy and occupational therapy. Exercise improves outcomes. Deep brain stimulation for severe cases.",
        "telugu": "పార్కిన్సన్స్ డిసీజ్", "hindi": "पार्किंसंस रोग"
    },
    "Vertigo": {
        "symptoms": ["spinning_movements","nausea","vomiting","loss_of_balance",
                     "unsteadiness","headache","ringing_in_ears","hearing_loss","sweating"],
        "severity": "moderate", "category": "Neurological",
        "icd10": "H81",
        "advice": "Epley maneuver for BPPV. Vestibular sedatives (Betahistine). Vestibular rehab exercises. Avoid sudden head movements.",
        "telugu": "వర్టిగో", "hindi": "चक्कर आना"
    },
    "Cervical Spondylosis": {
        "symptoms": ["neck_pain","back_pain","weakness_in_limbs","dizziness",
                     "headache","numbness","tingling","stiff_neck","loss_of_balance"],
        "severity": "moderate", "category": "Musculoskeletal",
        "icd10": "M47",
        "advice": "Physiotherapy. Cervical collar for acute pain. NSAIDs. Neck exercises. Surgery if neurological deficit worsens.",
        "telugu": "సర్వైకల్ స్పాండిలోసిస్", "hindi": "सर्वाइकल स्पॉन्डिलोसिस"
    },

    # ══════════════════════ MENTAL HEALTH ════════════════════════
    "Depression": {
        "symptoms": ["persistent_sadness","fatigue","loss_of_appetite","sleep_disturbance",
                     "concentration_problems","worthlessness","weight_loss","depression",
                     "loss_of_interest","anxiety"],
        "severity": "moderate", "category": "Mental Health",
        "icd10": "F32",
        "advice": "Antidepressants (SSRIs) + psychotherapy. iCall/Vandrevala Foundation helpline: 1860-2662-345. Exercise helps. Do not isolate.",
        "telugu": "నిరాశ", "hindi": "अवसाद"
    },
    "Anxiety Disorder": {
        "symptoms": ["anxiety","restlessness","fatigue","concentration_problems",
                     "irritability","muscle_tension","sleep_disturbance","palpitations","sweating"],
        "severity": "moderate", "category": "Mental Health",
        "icd10": "F41",
        "advice": "CBT therapy. SSRIs/SNRIs. Breathing exercises. Mindfulness. Avoid caffeine. Exercise regularly. Helpline: 1800-599-0019.",
        "telugu": "ఆందోళన రుగ్మత", "hindi": "चिंता विकार"
    },

    # ══════════════════════ MUSCULOSKELETAL ════════════════════════
    "Rheumatoid Arthritis": {
        "symptoms": ["joint_pain","swelling_joints","movement_stiffness","fatigue",
                     "morning_stiffness","fever","weight_loss","anaemia","rheumatoid_nodules"],
        "severity": "moderate", "category": "Autoimmune",
        "icd10": "M05-M06",
        "advice": "DMARDs (Methotrexate). NSAIDs for pain. Physiotherapy. Low-impact exercise. Regular rheumatologist follow-up.",
        "telugu": "రుమటాయిడ్ ఆర్థ్రైటిస్", "hindi": "रुमेटीइड गठिया"
    },
    "Osteoarthritis": {
        "symptoms": ["joint_pain","knee_pain","hip_joint_pain","stiff_neck","movement_stiffness",
                     "swelling_joints","painful_walking","crepitus","loss_of_flexibility"],
        "severity": "moderate", "category": "Musculoskeletal",
        "icd10": "M15-M19",
        "advice": "Weight loss reduces stress on joints. Physiotherapy. Paracetamol/NSAIDs. Knee replacement for severe cases.",
        "telugu": "ఆస్టియోఆర్థ్రైటిస్", "hindi": "ऑस्टियोआर्थराइटिस"
    },
    "Gout": {
        "symptoms": ["severe_joint_pain","swelling_joints","redness_of_skin","warm_joints",
                     "knee_pain","ankle_pain","big_toe_pain","fever","tophi"],
        "severity": "moderate", "category": "Metabolic",
        "icd10": "M10",
        "advice": "Colchicine/NSAIDs for acute attack. Allopurinol for prevention. Avoid red meat, alcohol, purine-rich foods. Drink lots of water.",
        "telugu": "గౌట్", "hindi": "गठिया (गाउट)"
    },
    "Osteoporosis": {
        "symptoms": ["back_pain","loss_of_height","fracture_prone","bone_pain",
                     "stooped_posture","brittle_nails","muscle_weakness"],
        "severity": "moderate", "category": "Musculoskeletal",
        "icd10": "M80-M81",
        "advice": "Calcium + Vitamin D3 supplements. Bisphosphonates (Alendronate). Weight-bearing exercise. Fall prevention. Bone density scan.",
        "telugu": "ఆస్టియోపోరోసిస్", "hindi": "ऑस्टियोपोरोसिस"
    },

    # ══════════════════════ KIDNEY / RENAL ════════════════════════
    "Chronic Kidney Disease": {
        "symptoms": ["fatigue","decreased_urine","swollen_legs","breathlessness",
                     "nausea","loss_of_appetite","itching","pallor","high_blood_pressure"],
        "severity": "high", "category": "Renal",
        "icd10": "N18",
        "advice": "Low protein, low potassium diet. Strict BP control. Dialysis if GFR < 15. Avoid NSAIDs/contrast dye. Transplant option.",
        "telugu": "దీర్ఘకాలిక కిడ్నీ వ్యాధి", "hindi": "क्रोनिक किडनी रोग"
    },
    "Kidney Stones": {
        "symptoms": ["severe_back_pain","flank_pain","blood_in_urine","nausea","vomiting",
                     "burning_micturition","frequent_urination","restlessness","chills"],
        "severity": "high", "category": "Renal",
        "icd10": "N20",
        "advice": "Drink 3-4 litres water daily. IV pain relief for acute pain. ESWL/ureteroscopy for stones > 5mm. Low oxalate diet.",
        "telugu": "కిడ్నీ స్టోన్స్", "hindi": "गुर्दे की पथरी"
    },
    "Nephrotic Syndrome": {
        "symptoms": ["swollen_legs","puffy_face_and_eyes","frothy_urine","weight_gain",
                     "fatigue","loss_of_appetite","breathlessness","pallor"],
        "severity": "high", "category": "Renal",
        "icd10": "N04",
        "advice": "Prednisolone as prescribed. Low salt, moderate protein diet. Diuretics for edema. Monitor urine protein regularly.",
        "telugu": "నెఫ్రోటిక్ సిండ్రోమ్", "hindi": "नेफ्रोटिक सिंड्रोम"
    },

    # ══════════════════════ SKIN DISEASES ════════════════════════
    "Psoriasis": {
        "symptoms": ["skin_rash","silver_patches","itching","joint_pain","skin_peeling",
                     "redness_of_skin","dry_skin","scaly_patches","nail_changes"],
        "severity": "moderate", "category": "Dermatological",
        "icd10": "L40",
        "advice": "Topical corticosteroids. Moisturize regularly. Avoid triggers: stress, infections. Biologics for severe cases. Phototherapy.",
        "telugu": "సోరియాసిస్", "hindi": "सोरायसिस"
    },
    "Eczema (Atopic Dermatitis)": {
        "symptoms": ["itching","skin_rash","redness_of_skin","dry_skin","blisters",
                     "weeping_skin","cracked_skin","thickened_skin","swollen_skin"],
        "severity": "mild", "category": "Dermatological",
        "icd10": "L20",
        "advice": "Moisturize 2x daily. Topical steroids for flares. Avoid triggers: soaps, detergents, pet dander. Antihistamines for itch.",
        "telugu": "ఎక్జిమా", "hindi": "एक्जिमा"
    },
    "Ringworm (Tinea)": {
        "symptoms": ["skin_rash","itching","circular_rash","redness_of_skin",
                     "skin_peeling","scaly_patches","hair_loss_patch"],
        "severity": "mild", "category": "Fungal",
        "icd10": "B35",
        "advice": "Antifungal cream (Clotrimazole/Fluconazole). Keep area dry. Don't share towels/combs. Oral antifungals for severe cases.",
        "telugu": "రింగ్‌వర్మ్", "hindi": "दाद"
    },
    "Scabies": {
        "symptoms": ["intense_itching","skin_rash","blisters","burrow_tracks",
                     "itching_worse_at_night","redness_of_skin","scratching_sores"],
        "severity": "mild", "category": "Parasitic",
        "icd10": "B86",
        "advice": "Permethrin 5% cream all over body. All household members treated simultaneously. Wash all clothes/bedding in hot water.",
        "telugu": "స్కేబీస్", "hindi": "खुजली (स्केबीज)"
    },
    "Acne": {
        "symptoms": ["pus_filled_pimples","blackheads","skin_rash","oily_skin",
                     "scurring","nodal_skin_eruptions","redness_of_skin"],
        "severity": "mild", "category": "Dermatological",
        "icd10": "L70",
        "advice": "Benzoyl peroxide/Salicylic acid wash. Don't pop pimples. Low GI diet. Topical retinoids. Isotretinoin for severe cystic acne.",
        "telugu": "మొటిమలు", "hindi": "मुँहासे"
    },
    "Vitiligo": {
        "symptoms": ["skin_depigmentation","white_patches","dischromic_patches",
                     "spreading_white_areas","sensitivity_to_sun"],
        "severity": "mild", "category": "Autoimmune",
        "icd10": "L80",
        "advice": "Topical steroids / tacrolimus. Phototherapy (PUVA/NB-UVB). Sun protection. Cosmetic cover. Psychological support important.",
        "telugu": "విటిలిగో", "hindi": "विटिलिगो (सफेद दाग)"
    },
    "Fungal Infection": {
        "symptoms": ["itching","skin_rash","nodal_skin_eruptions","dischromic_patches",
                     "skin_peeling","redness_of_skin","blisters"],
        "severity": "mild", "category": "Fungal",
        "icd10": "B35-B49",
        "advice": "Antifungal cream (Clotrimazole/Miconazole). Keep skin dry. Avoid tight clothing. Oral antifungals (Fluconazole) if severe.",
        "telugu": "ఫంగల్ ఇన్ఫెక్షన్", "hindi": "फंगल संक्रमण"
    },
    "Impetigo": {
        "symptoms": ["red_sore_around_nose","yellow_crust_ooze","blisters","skin_rash",
                     "itching","high_fever","swelled_lymph_nodes"],
        "severity": "mild", "category": "Bacterial",
        "icd10": "L01",
        "advice": "Topical mupirocin. Oral antibiotics if widespread. Keep area clean. Highly contagious — don't share towels.",
        "telugu": "ఇంపెటిగో", "hindi": "इम्पेटिगो"
    },

    # ══════════════════════ EYE DISEASES ════════════════════════
    "Conjunctivitis (Pink Eye)": {
        "symptoms": ["redness_of_eyes","watering_from_eyes","discharge_from_eye",
                     "itching","blurred_and_distorted_vision","swollen_eyelids","light_sensitivity"],
        "severity": "mild", "category": "Ophthalmological",
        "icd10": "H10",
        "advice": "Antibiotic eye drops (Ciprofloxacin). Cool compress. Don't rub eyes. Very contagious — wash hands frequently.",
        "telugu": "కంజంక్టివైటిస్", "hindi": "आंख आना"
    },
    "Cataract": {
        "symptoms": ["blurred_and_distorted_vision","glare","faded_colors","night_vision_problems",
                     "frequent_prescription_change","double_vision"],
        "severity": "moderate", "category": "Ophthalmological",
        "icd10": "H25-H26",
        "advice": "Surgery (phacoemulsification) is the only treatment. FREE at govt hospitals under NPCB. Don't delay — can cause blindness.",
        "telugu": "కంటి పొర", "hindi": "मोतियाबिंद"
    },
    "Glaucoma": {
        "symptoms": ["gradual_vision_loss","tunnel_vision","eye_pain","headache",
                     "nausea","halos_around_lights","blurred_vision"],
        "severity": "high", "category": "Ophthalmological",
        "icd10": "H40",
        "advice": "Eye drops (Timolol/Latanoprost) daily. Laser/surgery if eye drops fail. Regular IOP monitoring. Cannot reverse damage.",
        "telugu": "గ్లాకోమా", "hindi": "काला मोतिया"
    },
    "Diabetic Retinopathy": {
        "symptoms": ["blurred_and_distorted_vision","floaters","dark_spots","vision_loss",
                     "color_vision_problems","fluctuating_vision"],
        "severity": "high", "category": "Ophthalmological",
        "icd10": "H36.0",
        "advice": "Strict blood sugar control. Annual retinal exam for all diabetics. Laser photocoagulation. Anti-VEGF injections. Early detection saves sight.",
        "telugu": "డయాబెటిక్ రెటినోపతి", "hindi": "मधुमेह रेटिनोपैथी"
    },

    # ══════════════════════ EAR / ENT ════════════════════════
    "Otitis Media (Ear Infection)": {
        "symptoms": ["ear_pain","hearing_loss","mild_fever","headache","discharge_from_ear",
                     "ringing_in_ears","nausea","irritability"],
        "severity": "mild", "category": "ENT",
        "icd10": "H65-H66",
        "advice": "Antibiotics (Amoxicillin) for bacterial. Analgesics for pain. Avoid water in ear. Follow up after treatment.",
        "telugu": "చెవి సంక్రమణ", "hindi": "कान का संक्रमण"
    },
    "Sinusitis": {
        "symptoms": ["sinus_pressure","headache","nasal_congestion","runny_nose",
                     "facial_pain","reduced_smell","mild_fever","post_nasal_drip","cough"],
        "severity": "mild", "category": "ENT",
        "icd10": "J32",
        "advice": "Steam inhalation. Saline nasal spray. Decongestants. Antibiotics for bacterial sinusitis > 10 days. FESS surgery for chronic.",
        "telugu": "సైనసైటిస్", "hindi": "साइनसाइटिस"
    },
    "Tonsillitis": {
        "symptoms": ["throat_pain","throat_irritation","high_fever","swelled_lymph_nodes",
                     "difficulty_swallowing","fatigue","bad_breath","red_tonsils"],
        "severity": "mild", "category": "ENT",
        "icd10": "J03",
        "advice": "Antibiotics (Penicillin/Amoxicillin) for bacterial. Warm salt gargle. Paracetamol for pain. Tonsillectomy for recurrent cases.",
        "telugu": "టాన్సిలైటిస్", "hindi": "टॉन्सिलाइटिस"
    },

    # ══════════════════════ REPRODUCTIVE / WOMEN'S HEALTH ════════════════════════
    "Polycystic Ovary Syndrome (PCOS)": {
        "symptoms": ["abnormal_menstruation","weight_gain","excessive_hunger","acne",
                     "hair_loss","excessive_hair_growth","mood_swings","fatigue","infertility"],
        "severity": "moderate", "category": "Reproductive",
        "icd10": "E28.2",
        "advice": "Weight loss (5-10%) improves symptoms significantly. Metformin. OCP for menstrual regulation. Inositol supplement. Exercise.",
        "telugu": "పీసీఓఎస్", "hindi": "पीसीओएस"
    },
    "Endometriosis": {
        "symptoms": ["severe_pelvic_pain","painful_menstruation","pain_during_sex",
                     "heavy_bleeding","fatigue","nausea","bloating","infertility"],
        "severity": "moderate", "category": "Reproductive",
        "icd10": "N80",
        "advice": "NSAIDs for pain. Hormonal therapy (OCP/GnRH). Laparoscopic surgery. Fertility treatment if needed. Manage with support.",
        "telugu": "ఎండోమెట్రియోసిస్", "hindi": "एंडोमेट्रियोसिस"
    },
    "Preeclampsia": {
        "symptoms": ["high_blood_pressure","severe_headache","blurred_vision","swollen_legs",
                     "swelling_of_stomach","nausea","vomiting","decreased_urine"],
        "severity": "high", "category": "Obstetric",
        "icd10": "O14",
        "advice": "OBSTETRIC EMERGENCY. Hospitalize immediately. Magnesium sulfate for seizure prevention. Delivery may be needed. Monitor baby.",
        "telugu": "ప్రీఎక్లాంప్సియా", "hindi": "प्रीएक्लेम्पसिया"
    },

    # ══════════════════════ CHILDHOOD DISEASES ════════════════════════
    "Childhood Malnutrition": {
        "symptoms": ["weight_loss","fatigue","weakness_in_limbs","swollen_legs",
                     "dry_skin","hair_loss","poor_concentration","frequent_infections","pallor"],
        "severity": "high", "category": "Nutritional",
        "icd10": "E40-E46",
        "advice": "CMAM programme at PHC. Ready-to-use therapeutic food (RUTF). Treat infections. Micronutrient supplements. NRC admission if SAM.",
        "telugu": "పోషకాహార లోపం", "hindi": "कुपोषण"
    },
    "Rotavirus Diarrhea": {
        "symptoms": ["watery_diarrhoea","vomiting","mild_fever","dehydration",
                     "stomach_pain","loss_of_appetite","fatigue"],
        "severity": "high", "category": "Gastrointestinal",
        "icd10": "A08.0",
        "advice": "ORS immediately. Zinc 20mg for 14 days. Breastfeed continuously. Hospitalize if severely dehydrated. Rotavirus vaccine prevents it.",
        "telugu": "రోటావైరస్ విరేచనాలు", "hindi": "रोटावायरस दस्त"
    },
    "Kawasaki Disease": {
        "symptoms": ["high_fever_over_5_days","skin_rash","redness_of_eyes","red_lips",
                     "swelled_lymph_nodes","red_palms","swollen_hands","irritability"],
        "severity": "high", "category": "Pediatric",
        "icd10": "M30.3",
        "advice": "IVIG + Aspirin — start immediately. Echocardiogram mandatory. Hospitalize. Can cause coronary aneurysm if untreated.",
        "telugu": "కవాసాకి డిసీజ్", "hindi": "कावासाकी रोग"
    },

    # ══════════════════════ CANCER (EARLY WARNING) ════════════════════════
    "Oral Cancer": {
        "symptoms": ["ulcers_on_tongue","patches_in_throat","difficulty_swallowing",
                     "weight_loss","swelled_lymph_nodes","mouth_pain","hoarse_voice","bleeding_gums"],
        "severity": "high", "category": "Oncological",
        "icd10": "C00-C14",
        "advice": "See oncologist urgently. Stop tobacco/betel nut/alcohol IMMEDIATELY. Biopsy for diagnosis. Surgery+radiation. Early detection = high survival.",
        "telugu": "నోటి క్యాన్సర్", "hindi": "मुख कैंसर"
    },
    "Cervical Cancer": {
        "symptoms": ["abnormal_vaginal_bleeding","discharge","pelvic_pain",
                     "pain_during_sex","leg_swelling","weight_loss","fatigue"],
        "severity": "high", "category": "Oncological",
        "icd10": "C53",
        "advice": "HPV vaccination prevents it. Pap smear every 3 years. VIA screening at PHC is FREE. Early detection is curable. No stigma.",
        "telugu": "సర్వైకల్ క్యాన్సర్", "hindi": "गर्भाशय ग्रीवा का कैंसर"
    },
    "Breast Cancer": {
        "symptoms": ["breast_lump","nipple_discharge","breast_pain","dimpling_skin",
                     "nipple_inversion","swelled_lymph_nodes","breast_redness","weight_loss"],
        "severity": "high", "category": "Oncological",
        "icd10": "C50",
        "advice": "Self-exam monthly. Mammogram after 40. PMNL scheme for free treatment. Surgery+chemo+radiation. Early stage = 95% survival.",
        "telugu": "బ్రెస్ట్ క్యాన్సర్", "hindi": "स्तन कैंसर"
    },

    # ══════════════════════ OTHER IMPORTANT DISEASES ════════════════════════
    "Dehydration": {
        "symptoms": ["excessive_thirst","dry_mouth","dark_urine","dizziness","fatigue",
                     "headache","dry_skin","decreased_urine","sunken_eyes","muscle_cramps"],
        "severity": "moderate", "category": "General",
        "icd10": "E86",
        "advice": "ORS solution. Coconut water. Drink 3L water daily. Avoid sugary drinks. IV fluids if severe dehydration. Seek shade.",
        "telugu": "నిర్జలీకరణం", "hindi": "निर्जलीकरण"
    },
    "Sunstroke / Heat Stroke": {
        "symptoms": ["high_fever","hot_dry_skin","headache","dizziness","nausea",
                     "confusion","rapid_heart_rate","no_sweating","altered_sensorium"],
        "severity": "high", "category": "Environmental",
        "icd10": "T67",
        "advice": "Move to cool place immediately. Cold wet cloth on body. Cold water to drink. Call 108 if unconscious. Fan continuously.",
        "telugu": "సన్‌స్ట్రోక్", "hindi": "लू लगना"
    },
    "Varicose Veins": {
        "symptoms": ["swollen_blood_vessels","prominent_veins_on_calf","leg_pain",
                     "swollen_legs","itching","cramps","fatigue","skin_discoloration_leg"],
        "severity": "mild", "category": "Vascular",
        "icd10": "I83",
        "advice": "Compression stockings. Elevate legs. Exercise regularly. Avoid prolonged standing. Sclerotherapy/surgery for severe cases.",
        "telugu": "వేరికోస్ వెయిన్స్", "hindi": "वैरिकाज़ नसें"
    },
    "Allergic Rhinitis": {
        "symptoms": ["continuous_sneezing","runny_nose","itching","watering_from_eyes",
                     "congestion","throat_irritation","headache","sinus_pressure","fatigue"],
        "severity": "mild", "category": "Allergic",
        "icd10": "J30",
        "advice": "Identify allergens (dust, pollen, pet dander). Antihistamines (Cetirizine). Nasal corticosteroid spray. Allergen immunotherapy.",
        "telugu": "అలర్జిక్ రినైటిస్", "hindi": "एलर्जिक राइनाइटिस"
    },
    "Drug Reaction / Allergy": {
        "symptoms": ["itching","skin_rash","burning_micturition","spotting_urination",
                     "stomach_pain","swelling","breathing_difficulty","hives"],
        "severity": "high", "category": "Allergic",
        "icd10": "T88.7",
        "advice": "Stop the offending drug IMMEDIATELY. Antihistamines + corticosteroids. Call 108 if anaphylaxis. Carry allergy card.",
        "telugu": "డ్రగ్ రియాక్షన్", "hindi": "दवा एलर्जी"
    },
    "Insomnia": {
        "symptoms": ["difficulty_sleeping","fatigue","irritability","headache",
                     "poor_concentration","anxiety","depression","daytime_sleepiness","mood_swings"],
        "severity": "mild", "category": "Sleep",
        "icd10": "G47.0",
        "advice": "Fixed sleep schedule. No screens 1 hour before bed. No caffeine after 4pm. CBT-I therapy most effective. Melatonin for short-term.",
        "telugu": "నిద్రలేమి", "hindi": "अनिद्रा"
    },
    "Dengue Shock Syndrome": {
        "symptoms": ["high_fever","severe_abdominal_pain","persistent_vomiting","bleeding",
                     "rapid_breathing","fatigue","restlessness","cold_clammy_skin","altered_sensorium"],
        "severity": "high", "category": "Infectious",
        "icd10": "A91",
        "advice": "ICU ADMISSION REQUIRED IMMEDIATELY. IV fluid resuscitation. Platelet transfusion. Intensive monitoring. CALL 108 NOW.",
        "telugu": "డెంగ్యూ షాక్ సిండ్రోమ్", "hindi": "डेंगू शॉक सिंड्रोम"
    },
    "Hypoglycemia": {
        "symptoms": ["drying_and_tingling_lips","sweating","headache","nausea","anxiety",
                     "blurred_and_distorted_vision","slurred_speech","irritability",
                     "excessive_hunger","palpitations","fatigue"],
        "severity": "high", "category": "Endocrine",
        "icd10": "E16.0",
        "advice": "15-15 rule: 15g fast carbs (glucose tab/juice), recheck after 15 min. If unconscious: glucagon injection. Then eat a meal.",
        "telugu": "హైపోగ్లైసీమియా", "hindi": "हाइपोग्लाइसीमिया"
    },
    "Worm Infestation": {
        "symptoms": ["stomach_pain","loss_of_appetite","weight_loss","fatigue",
                     "internal_itching","irritation_in_anus","nausea","anaemia","diarrhoea"],
        "severity": "mild", "category": "Parasitic",
        "icd10": "B77-B83",
        "advice": "Albendazole 400mg single dose. All family members treat together. Wash hands before eating. Cook food well. Clean water.",
        "telugu": "వర్మ్ ఇన్ఫెక్షన్", "hindi": "कृमि संक्रमण"
    },
}

# ─── Disease metadata for quick lookup ───────────────────────────────────────
DISEASE_NAMES   = list(DISEASE_DB.keys())           # 108 diseases
NUM_DISEASES    = len(DISEASE_NAMES)
NUM_SYMPTOMS    = len(ALL_SYMPTOMS)

# ─── Severity groupings for reporting ────────────────────────────────────────
HIGH_SEVERITY     = [d for d, v in DISEASE_DB.items() if v["severity"] == "high"]
MODERATE_SEVERITY = [d for d, v in DISEASE_DB.items() if v["severity"] == "moderate"]
MILD_SEVERITY     = [d for d, v in DISEASE_DB.items() if v["severity"] == "mild"]

# ─── Category groupings ───────────────────────────────────────────────────────
CATEGORIES = {}
for d, v in DISEASE_DB.items():
    cat = v["category"]
    CATEGORIES.setdefault(cat, []).append(d)

if __name__ == "__main__":
    print(f"✅ Dataset loaded:")
    print(f"   Diseases  : {NUM_DISEASES}")
    print(f"   Symptoms  : {NUM_SYMPTOMS}")
    print(f"   High sev  : {len(HIGH_SEVERITY)}")
    print(f"   Moderate  : {len(MODERATE_SEVERITY)}")
    print(f"   Mild      : {len(MILD_SEVERITY)}")
    print(f"   Categories: {list(CATEGORIES.keys())}")
