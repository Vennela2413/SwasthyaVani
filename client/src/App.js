import { useState, useRef, useCallback } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import { predict, saveRecord, getHistory, deleteRecord, getNearbyDoctors, getStats, updateLang } from "./api";

const UI = {
  en: { title:"SwasthyaVani", tag:"Healthcare for Every Village", placeholder:"Type symptoms in English, Telugu or Hindi...", btn:"Get Diagnosis", mic:"Tap to speak", listening:"Listening...", history:"Health History", doctors:"Nearby Doctors", home:"Home", check:"Diagnose", noHistory:"No records yet. Do your first checkup!", result:"Possible Conditions", advice:"Doctor Advice", login:"Login", logout:"Logout", emergency:"🚑 EMERGENCY - Go to Hospital NOW!", mild:"Mild", moderate:"Moderate", serious:"Serious", match:"Match", detected:"Symptoms detected", checkAgain:"Check Again", findDoctors:"Find Nearby Doctors" },
  te: { title:"స్వాస్థ్యవాణి", tag:"ప్రతి గ్రామానికి వైద్యసేవ", placeholder:"తెలుగు, హిందీ లేదా ఇంగ్లీషులో లక్షణాలు చెప్పండి...", btn:"రోగనిర్ధారణ చేయండి", mic:"మాట్లాడటానికి నొక్కండి", listening:"వింటోంది...", history:"ఆరోగ్య చరిత్ర", doctors:"దగ్గర డాక్టర్లు", home:"హోమ్", check:"పరీక్ష", noHistory:"ఇంకా రికార్డులు లేవు. మీ మొదటి పరీక్ష చేయండి!", result:"సాధ్యమైన వ్యాధులు", advice:"డాక్టర్ సలహా", login:"లాగిన్", logout:"లాగ్‌అవుట్", emergency:"🚑 అత్యవసరం - వెంటనే ఆసుపత్రికి వెళ్ళండి!", mild:"తక్కువ", moderate:"మధ్యమ", serious:"తీవ్రమైన", match:"సరిపోలిక", detected:"గుర్తించిన లక్షణాలు", checkAgain:"మళ్ళీ పరీక్షించు", findDoctors:"దగ్గర డాక్టర్లు కనుగొనండి" },
  hi: { title:"स्वास्थ्यवाणी", tag:"हर गाँव के लिए स्वास्थ्य सेवा", placeholder:"हिंदी, तेलुगु या अंग्रेजी में लक्षण बताएं...", btn:"जांच करें", mic:"बोलने के लिए दबाएं", listening:"सुन रहा हूं...", history:"स्वास्थ्य इतिहास", doctors:"पास के डॉक्टर", home:"होम", check:"जांच", noHistory:"अभी कोई रिकॉर्ड नहीं। पहली जांच करें!", result:"संभावित बीमारियाँ", advice:"डॉक्टर की सलाह", login:"लॉगिन", logout:"लॉगआउट", emergency:"🚑 आपातकाल - तुरंत अस्पताल जाएं!", mild:"हल्का", moderate:"मध्यम", serious:"गंभीर", match:"मिलान", detected:"मिले लक्षण", checkAgain:"फिर से जांचें", findDoctors:"पास के डॉक्टर खोजें" },
};

// ── Huge disease database ────────────────────────────────────────────────────
const DISEASES = {
  "Malaria":           { s:["fever","chills","sweating","headache","nausea","vomiting","muscle pain","fatigue","shivering","high fever"], sev:"high",  e:"🦟", a:"Visit doctor immediately. Take prescribed antimalarial drugs. Use mosquito nets. Stay hydrated.", te:"మలేరియా", hi:"मलेरिया" },
  "Dengue":            { s:["skin rash","chills","joint pain","vomiting","fatigue","high fever","headache","nausea","pain behind eyes","back pain","muscle pain","red spots"], sev:"high",  e:"🩸", a:"See doctor immediately. Drink papaya leaf juice. Stay hydrated. Monitor platelet count. Avoid aspirin.", te:"డెంగ్యూ", hi:"डेंगू" },
  "Typhoid":           { s:["chills","vomiting","fatigue","high fever","headache","nausea","constipation","stomach pain","diarrhea","weakness","belly pain"], sev:"high",  e:"🌡️", a:"Consult doctor urgently. Eat soft food. Drink only boiled water. Complete full antibiotic course.", te:"టైఫాయిడ్", hi:"टाइफाइड" },
  "Tuberculosis":      { s:["chills","vomiting","fatigue","weight loss","cough","high fever","breathlessness","sweating","loss of appetite","blood in cough","chest pain","night sweats"], sev:"high",  e:"🫁", a:"Go to government hospital immediately — TB treatment is FREE. Take full DOTS course. Cover mouth while coughing.", te:"క్షయవ్యాధి", hi:"तपेदिक" },
  "Dengue Fever":      { s:["sudden high fever","severe headache","pain behind eyes","joint pain","muscle pain","rash","bleeding","nausea","fatigue"], sev:"high",  e:"🔴", a:"Hospitalize immediately. Monitor platelets. IV fluids if needed. Avoid NSAIDs.", te:"డెంగ్యూ జ్వరం", hi:"डेंगू बुखार" },
  "Jaundice":          { s:["yellow skin","yellow eyes","dark urine","pale stools","fatigue","stomach pain","fever","nausea","itching"], sev:"high",  e:"💛", a:"See doctor immediately. Drink sugarcane juice. Eat light food. Avoid fatty foods and alcohol completely.", te:"కామెర్లు", hi:"पीलिया" },
  "Hepatitis A":       { s:["joint pain","vomiting","yellow skin","dark urine","nausea","loss of appetite","stomach pain","diarrhea","mild fever","yellow eyes","muscle pain"], sev:"high",  e:"🟡", a:"See doctor. Avoid alcohol. Rest well. Eat light food. Maintain good hygiene. Vaccination available.", te:"హెపటైటిస్ ఎ", hi:"हेपेटाइटिस ए" },
  "Hepatitis B":       { s:["itching","fatigue","yellow skin","dark urine","loss of appetite","stomach pain","yellow eyes","weakness","nausea"], sev:"high",  e:"🟠", a:"See doctor immediately. Get vaccinated. Avoid sharing needles or razors. Complete treatment course.", te:"హెపటైటిస్ బి", hi:"हेपेटाइटिस बी" },
  "Heart Attack":      { s:["chest pain","breathlessness","sweating","vomiting","arm pain","jaw pain","dizziness","palpitations","anxiety"], sev:"high",  e:"💔", a:"CALL 108 IMMEDIATELY. Chew aspirin if available. Do NOT drive yourself. This is life-threatening.", te:"గుండె పోటు", hi:"दिल का दौरा" },
  "Pneumonia":         { s:["chills","fatigue","cough","high fever","breathlessness","sweating","chest pain","fast heartbeat","rusty sputum","difficulty breathing"], sev:"high",  e:"🫀", a:"See doctor immediately. Complete full antibiotic course. Rest well. Stay warm and hydrated.", te:"న్యుమోనియా", hi:"निमोनिया" },
  "Meningitis":        { s:["severe headache","stiff neck","high fever","vomiting","sensitivity to light","rash","confusion","seizures"], sev:"high",  e:"🧠", a:"MEDICAL EMERGENCY. Go to hospital immediately. Do not delay. Can be life-threatening within hours.", te:"మెనింజైటిస్", hi:"मेनिनजाइटिस" },
  "Cholera":           { s:["watery diarrhea","vomiting","dehydration","muscle cramps","nausea","weakness","sunken eyes","dry mouth"], sev:"high",  e:"💧", a:"Drink ORS immediately. Go to hospital. Complete antibiotic course. Boil all drinking water.", te:"కలరా", hi:"हैजा" },
  "Diabetes":          { s:["frequent urination","excessive thirst","weight loss","blurred vision","slow healing","fatigue","numbness","hunger","polyuria"], sev:"moderate", e:"💉", a:"Control sugar intake. Exercise daily. Take prescribed medicine. Monitor blood sugar regularly. Eat balanced meals.", te:"మధుమేహం", hi:"मधुमेह" },
  "Hypertension":      { s:["headache","chest pain","dizziness","loss of balance","blurred vision","palpitations","fatigue","nosebleed"], sev:"moderate", e:"❤️", a:"Reduce salt intake. Exercise regularly. Avoid stress. Take prescribed BP medicines daily. Monitor BP regularly.", te:"అధిక రక్తపోటు", hi:"उच्च रक्तचाप" },
  "Bronchial Asthma":  { s:["fatigue","cough","high fever","breathlessness","wheezing","chest tightness","difficulty breathing","mucus"], sev:"moderate", e:"💨", a:"Keep inhaler always with you. Avoid dust, smoke, allergens. Breathe through nose. Sit upright during attacks.", te:"ఆస్తమా", hi:"दमा" },
  "Chicken Pox":       { s:["itching","skin rash","fatigue","high fever","headache","loss of appetite","mild fever","red spots","blisters","scabs"], sev:"moderate", e:"🔵", a:"Apply calamine lotion. Cut nails short. Avoid scratching. Isolate from others. See doctor if blisters spread.", te:"చికెన్‌పాక్స్", hi:"चिकनपॉक्स" },
  "Anemia":            { s:["fatigue","weakness","pale skin","shortness of breath","dizziness","cold hands","headache","chest pain","brittle nails"], sev:"moderate", e:"🩺", a:"Eat iron-rich foods: spinach, jaggery, dates, beans. Take iron supplements. Drink vitamin C with meals.", te:"రక్తహీనత", hi:"एनीमिया" },
  "Hypothyroidism":    { s:["fatigue","weight gain","cold hands","mood swings","lethargy","dizziness","puffy face","dry skin","depression","hair loss","constipation"], sev:"moderate", e:"🦋", a:"Take prescribed thyroid medicine daily. Regular blood tests. Eat iodine-rich food. Exercise regularly.", te:"హైపోథైరాయిడిజం", hi:"हाइपोथायरायडिज्म" },
  "Hyperthyroidism":   { s:["fatigue","mood swings","weight loss","restlessness","sweating","diarrhea","fast heartbeat","excessive hunger","irritability","tremors"], sev:"moderate", e:"⚡", a:"See endocrinologist. Take prescribed medicines. Avoid caffeine. Eat calcium-rich foods. Regular monitoring.", te:"హైపర్‌థైరాయిడిజం", hi:"हाइपरथायरायडिज्म" },
  "Gastroenteritis":   { s:["vomiting","diarrhea","stomach pain","nausea","fever","dehydration","weakness","loss of appetite","cramps"], sev:"moderate", e:"🫃", a:"Drink ORS solution every 30 minutes. Eat light food like rice and banana. Rest. See doctor if continues.", te:"గ్యాస్ట్రోఎంటరైటిస్", hi:"आंत्रशोथ" },
  "Migraine":          { s:["headache","nausea","vomiting","sensitivity to light","blurred vision","dizziness","neck pain","aura","pulsating pain"], sev:"moderate", e:"🤕", a:"Rest in dark quiet room. Cold compress on forehead. Avoid triggers like bright light and loud noise.", te:"మైగ్రేన్", hi:"माइग्रेन" },
  "Arthritis":         { s:["joint pain","stiff neck","swollen joints","movement difficulty","painful walking","muscle weakness","redness","warmth in joints"], sev:"moderate", e:"🦴", a:"Take prescribed anti-inflammatory medicines. Do gentle exercises. Apply warm compress. Maintain healthy weight.", te:"ఆర్థ్రైటిస్", hi:"गठिया" },
  "Urinary Infection": { s:["burning urination","frequent urination","bladder discomfort","foul smell urine","pelvic pain","fever","cloudy urine"], sev:"moderate", e:"🚽", a:"Drink plenty of water. See doctor for antibiotics. Avoid spicy food. Maintain hygiene. Cranberry juice helps.", te:"మూత్ర సంక్రమణ", hi:"मूत्र संक्रमण" },
  "Psoriasis":         { s:["skin rash","joint pain","skin peeling","silver patches","small dents in nails","itching","red patches"], sev:"moderate", e:"🔶", a:"Use prescribed moisturizers and creams. Avoid scratching. Manage stress. See dermatologist regularly.", te:"సోరియాసిస్", hi:"सोरायसिस" },
  "Varicose Veins":    { s:["fatigue","cramps","bruising","obesity","swollen legs","visible veins","heaviness in legs","itching around veins"], sev:"moderate", e:"🦵", a:"Elevate legs when resting. Wear compression stockings. Exercise regularly. Avoid standing for long periods.", te:"వేరికోస్ వెయిన్స్", hi:"वैरिकाज़ नसें" },
  "Hypoglycemia":      { s:["fatigue","vomiting","anxiety","sweating","headache","nausea","blurred vision","irritability","excessive hunger","palpitations","shakiness"], sev:"moderate", e:"🍬", a:"Eat sugar immediately — glucose tablet, juice or candy. Then eat a proper meal. Monitor blood sugar.", te:"హైపోగ్లైసీమియా", hi:"हाइपोग्लाइसीमिया" },
  "GERD":              { s:["stomach pain","acidity","vomiting","cough","chest pain","heartburn","regurgitation","difficulty swallowing"], sev:"moderate", e:"🔥", a:"Eat small frequent meals. Avoid spicy, oily, acidic food. Don't lie down after eating. Take antacids.", te:"జీఈఆర్డీ", hi:"गर्ड" },
  "Common Cold":       { s:["runny nose","sneezing","cough","sore throat","congestion","mild fever","headache","body ache","fatigue"], sev:"mild",  e:"🤧", a:"Rest well. Drink warm turmeric milk or ginger tea. Steam inhalation. Avoid cold food and drinks.", te:"జలుబు", hi:"सर्दी-जुकाम" },
  "Flu":               { s:["high fever","chills","body ache","headache","fatigue","cough","sore throat","runny nose","vomiting","weakness"], sev:"mild",  e:"🤒", a:"Rest completely. Take paracetamol for fever. Drink warm fluids. Avoid contact with others. Vaccinate yearly.", te:"ఫ్లూ", hi:"फ्लू" },
  "Acne":              { s:["skin rash","pimples","blackheads","whiteheads","oily skin","scarring","inflammation"], sev:"mild",  e:"😣", a:"Wash face twice daily. Use non-comedogenic products. Don't pop pimples. See dermatologist for severe cases.", te:"మొటిమలు", hi:"मुँहासे" },
  "Allergies":         { s:["sneezing","runny nose","itching","watery eyes","skin rash","congestion","hives","swelling"], sev:"mild",  e:"🌸", a:"Avoid known allergens. Take antihistamines. Keep windows closed during high pollen season. See allergist.", te:"అలెర్జీ", hi:"एलर्जी" },
  "Gastritis":         { s:["stomach pain","nausea","vomiting","bloating","indigestion","loss of appetite","burning sensation","belching"], sev:"mild",  e:"🫄", a:"Eat small frequent meals. Avoid spicy and oily food. Drink coconut water. Take antacids if needed.", te:"గ్యాస్ట్రైటిస్", hi:"गैस्ट्राइटिस" },
  "Constipation":      { s:["difficulty passing stool","bloating","stomach pain","nausea","loss of appetite","hard stool","straining"], sev:"mild",  e:"😖", a:"Drink 8 glasses water daily. Eat fiber-rich foods. Exercise regularly. Avoid processed food.", te:"మలబద్ధకం", hi:"कब्ज" },
  "Insomnia":          { s:["difficulty sleeping","fatigue","irritability","headache","poor concentration","anxiety","depression","daytime sleepiness"], sev:"mild",  e:"😴", a:"Maintain fixed sleep schedule. Avoid screens before bed. No caffeine after 4pm. Try warm milk before sleep.", te:"నిద్రలేమి", hi:"अनिद्रा" },
  "Back Pain":         { s:["back pain","muscle pain","stiffness","difficulty moving","pain radiating to leg","numbness","weakness in legs"], sev:"mild",  e:"🔙", a:"Apply hot or cold compress. Gentle stretching exercises. Avoid heavy lifting. See doctor if pain persists.", te:"వెన్నునొప్పి", hi:"पीठ दर्द" },
  "Dengue Mild":       { s:["mild fever","headache","body ache","joint pain","fatigue","loss of appetite","nausea"], sev:"mild",  e:"🌡️", a:"Rest well. Drink plenty of fluids. Take paracetamol only. Monitor for rash or bleeding. See doctor.", te:"డెంగ్యూ(తేలికపాటి)", hi:"डेंगू(हल्का)" },
  "Eye Infection":     { s:["red eyes","watery eyes","discharge","itching eyes","blurred vision","sensitivity to light","swollen eyelids"], sev:"mild",  e:"👁️", a:"Don't rub eyes. Use clean warm compress. See doctor for eye drops. Wash hands frequently.", te:"కంటి సంక్రమణ", hi:"आँख का संक्रमण" },
  "Ear Infection":     { s:["ear pain","hearing loss","discharge from ear","fever","headache","itching in ear","ringing in ear"], sev:"mild",  e:"👂", a:"See doctor for antibiotic ear drops. Keep ear dry. Don't insert objects into ear. Pain killers for relief.", te:"చెవి సంక్రమణ", hi:"कान का संक्रमण" },
  "Skin Infection":    { s:["skin rash","redness","swelling","pus","pain","warmth","itching","blisters","skin discoloration"], sev:"mild",  e:"🔴", a:"Keep area clean and dry. Apply prescribed antibiotic cream. Don't scratch. See doctor if spreading.", te:"చర్మ సంక్రమణ", hi:"त्वचा संक्रमण" },
  "Worm Infection":    { s:["stomach pain","loss of appetite","weight loss","fatigue","itching around anus","nausea","diarrhea","bloating"], sev:"mild",  e:"🪱", a:"Take deworming medicine (Albendazole). Wash hands before eating. Cook food properly. Drink clean water.", te:"వర్మ్ ఇన్ఫెక్షన్", hi:"कृमि संक्रमण" },
  "Dehydration":       { s:["excessive thirst","dry mouth","dark urine","dizziness","fatigue","headache","dry skin","low urine output"], sev:"mild",  e:"💦", a:"Drink ORS solution. Drink water and coconut water regularly. Avoid sugary drinks. Rest in cool place.", te:"నిర్జలీకరణం", hi:"निर्जलीकरण" },
  "Sunstroke":         { s:["high fever","hot dry skin","headache","dizziness","nausea","confusion","rapid heartbeat","no sweating"], sev:"high",  e:"☀️", a:"Move to cool place immediately. Apply cold wet cloth. Drink cold water. Call 108 if unconscious.", te:"సన్‌స్ట్రోక్", hi:"लू लगना" },
  "Food Poisoning":    { s:["nausea","vomiting","diarrhea","stomach cramps","fever","weakness","headache","loss of appetite"], sev:"moderate", e:"🤢", a:"Drink ORS and plenty of water. Avoid solid food for 6 hours. Eat bland food after. See doctor if severe.", te:"ఫుడ్ పాయిజనింగ్", hi:"खाद्य विषाक्तता" },
  "Malnutrition":      { s:["weight loss","fatigue","weakness","hair loss","slow healing","frequent illness","dry skin","poor concentration"], sev:"moderate", e:"🥗", a:"Eat balanced diet with proteins, carbs, fats. Take vitamins. See doctor for nutritional assessment. Govt schemes available.", te:"పోషకాహార లోపం", hi:"कुपोषण" },
};

const SEV  = { mild:"#22c55e", moderate:"#f59e0b", high:"#ef4444" };
const TIPS = ["Wash hands with soap for 20 seconds before eating.","Drink 8 glasses of clean water daily.","Eat vegetables and fruits every day.","Sleep 7-8 hours daily for good immunity.","Exercise or walk for 30 minutes daily.","Avoid smoking and alcohol completely.","Get your children vaccinated on time.","Boil drinking water if source is not clean."];

// ── Symptom matching engine ───────────────────────────────────────────────────
const TE_MAP = { "జ్వరం":"fever","దగ్గు":"cough","తలనొప్పి":"headache","వాంతి":"vomiting","విరేచనాలు":"diarrhea","నీరసం":"fatigue","కడుపు నొప్పి":"stomach pain","శరీర నొప్పి":"muscle pain","చలి":"chills","అలసట":"fatigue","మూత్రవిసర్జన":"frequent urination","దాహం":"excessive thirst","దద్దుర్లు":"skin rash","దురద":"itching","శ్వాస":"breathlessness","ఛాతీ నొప్పి":"chest pain","కీళ్ళ నొప్పి":"joint pain","వణుకు":"shivering","చెమట":"sweating","బరువు తగ్గడం":"weight loss","ఆకలి లేకపోవడం":"loss of appetite","పసుపు కళ్ళు":"yellow eyes","చీకటి మూత్రం":"dark urine","జలుబు":"runny nose","దురద":"itching","వికారం":"nausea","నొప్పి":"pain" };
const HI_MAP = { "बुखार":"fever","खांसी":"cough","सिरदर्द":"headache","उल्टी":"vomiting","दस्त":"diarrhea","कमजोरी":"fatigue","पेट दर्द":"stomach pain","बदन दर्द":"muscle pain","ठंड":"chills","थकान":"fatigue","बार बार पेशाब":"frequent urination","प्यास":"excessive thirst","चकत्ते":"skin rash","खुजली":"itching","सांस की तकलीफ":"breathlessness","सीने में दर्द":"chest pain","जोड़ों का दर्द":"joint pain","कंपकंपी":"shivering","पसीना":"sweating","वजन कम":"weight loss","भूख नहीं":"loss of appetite","पीली आंखें":"yellow eyes","गहरा पेशाब":"dark urine","नाक बहना":"runny nose","मतली":"nausea","दर्द":"pain","चक्कर":"dizziness","सूजन":"swelling" };

function matchDiseases(text) {
  let t = text.toLowerCase();
  Object.entries(TE_MAP).forEach(([k,v]) => { t = t.replace(new RegExp(k,"g"), v); });
  Object.entries(HI_MAP).forEach(([k,v]) => { t = t.replace(new RegExp(k,"g"), v); });
  const words = t.split(/[\s,،।\.;]+/).filter(w => w.length > 2);
  const scores = {};
  Object.entries(DISEASES).forEach(([name, d]) => {
    let hits = 0, matched = [];
    d.s.forEach(sym => {
      const sw = sym.split(" ");
      const found = sw.every(w => words.some(uw => uw.includes(w) || w.includes(uw))) || words.some(w => sym.includes(w) && w.length > 3);
      if (found) { hits++; matched.push(sym); }
    });
    if (hits > 0) scores[name] = { hits, matched, total: d.s.length, ...d };
  });
  return Object.entries(scores).sort((a,b) => b[1].hits - a[1].hits).slice(0,4).map(([name, d]) => ({
    name, confidence: Math.min(94, Math.round((d.hits/d.total)*100)+18), matched: d.matched, ...d
  }));
}

// ── NLP: phrase → canonical symptom (EN + TE + HI) — defined OUTSIDE component ──
// Sorted longest-first so "high fever" wins over "fever"
const SYMPTOM_NLP = [
  // English
  ["shortness of breath","breathlessness"],["difficulty breathing","breathlessness"],
  ["can't breathe","breathlessness"],["cannot breathe","breathlessness"],
  ["breathing problem","breathlessness"],["saans","breathlessness"],
  ["chest tightness","chest tightness"],["chest pain","chest pain"],
  ["chest discomfort","chest pain"],["pain behind eyes","pain behind eyes"],
  ["high fever","high fever"],["very high fever","high fever"],
  ["mild fever","mild fever"],["slight fever","mild fever"],
  ["low grade fever","mild fever"],["fever","fever"],["temperature","fever"],
  ["loss of appetite","loss of appetite"],["no appetite","loss of appetite"],
  ["not hungry","loss of appetite"],["excessive hunger","excessive hunger"],
  ["frequent urination","frequent urination"],["polyuria","frequent urination"],
  ["burning urination","burning urination"],["burning when peeing","burning urination"],
  ["pain while urinating","burning urination"],
  ["excessive thirst","excessive thirst"],["very thirsty","excessive thirst"],
  ["blurred vision","blurred vision"],["vision problem","blurred vision"],
  ["yellow eyes","yellow eyes"],["yellow skin","yellow skin"],["jaundice","yellow skin"],
  ["dark urine","dark urine"],["blood in urine","blood in urine"],
  ["blood in stool","blood in stool"],["bloody stool","blood in stool"],
  ["blood in cough","blood in sputum"],["coughing blood","blood in sputum"],
  ["blood in sputum","blood in sputum"],
  ["swollen legs","swollen legs"],["swollen ankles","swollen legs"],["leg swelling","swollen legs"],
  ["puffy face","puffy face"],["swollen face","puffy face"],
  ["weight loss","weight loss"],["losing weight","weight loss"],["lost weight","weight loss"],
  ["weight gain","weight gain"],["gaining weight","weight gain"],
  ["cold hands","cold hands"],["cold feet","cold hands"],["cold extremities","cold hands"],
  ["swollen lymph nodes","swollen lymph nodes"],["swollen glands","swollen lymph nodes"],
  ["glands swollen","swollen lymph nodes"],
  ["ringing in ears","ringing in ears"],["tinnitus","ringing in ears"],
  ["hearing loss","hearing loss"],["can't hear","hearing loss"],
  ["ear pain","ear pain"],["earache","ear pain"],
  ["sore throat","sore throat"],["throat pain","sore throat"],["painful throat","sore throat"],
  ["throat irritation","throat irritation"],
  ["runny nose","runny nose"],["nose running","runny nose"],
  ["blocked nose","nasal congestion"],["stuffy nose","nasal congestion"],["nasal congestion","nasal congestion"],
  ["memory loss","memory loss"],["forgetting things","memory loss"],
  ["pale skin","pale skin"],["pallor","pale skin"],
  ["hair loss","hair loss"],["losing hair","hair loss"],
  ["brittle nails","brittle nails"],["dry skin","dry skin"],
  ["skin rash","skin rash"],["body rash","skin rash"],["red rash","skin rash"],
  ["red spots","red spots"],["spots on body","red spots"],
  ["itching","itching"],["itchy","itching"],["itchy skin","itching"],
  ["blisters","blisters"],["water blisters","blisters"],
  ["night sweats","night sweats"],["sweating at night","night sweats"],
  ["sweating","sweating"],["excessive sweating","sweating"],
  ["chills","chills"],["feeling cold","chills"],["cold shivers","chills"],
  ["shivering","shivering"],["trembling","shivering"],["tremors","shivering"],
  ["fainting","fainting"],["blackout","fainting"],["passed out","fainting"],
  ["loss of consciousness","fainting"],
  ["seizures","seizures"],["fits","seizures"],["convulsions","seizures"],
  ["confusion","confusion"],["disoriented","confusion"],["not thinking clearly","confusion"],
  ["anxiety","anxiety"],["panic attack","anxiety"],["panicking","anxiety"],
  ["depression","depression"],["very sad","depression"],["hopeless","depression"],
  ["mood swings","mood swings"],["irritable","irritability"],["irritability","irritability"],
  ["sleep problem","sleep disturbance"],["can't sleep","sleep disturbance"],
  ["insomnia","sleep disturbance"],["not sleeping","sleep disturbance"],
  ["palpitations","palpitations"],["heart racing","palpitations"],["fast heartbeat","palpitations"],
  ["heart pounding","palpitations"],
  ["dizziness","dizziness"],["dizzy","dizziness"],["lightheaded","dizziness"],
  ["vertigo","vertigo"],["spinning feeling","vertigo"],["room spinning","vertigo"],
  ["nausea","nausea"],["feel like vomiting","nausea"],["queasy","nausea"],
  ["vomiting","vomiting"],["vomit","vomiting"],["threw up","vomiting"],["puking","vomiting"],
  ["diarrhea","diarrhea"],["diarrhoea","diarrhea"],["loose motions","diarrhea"],
  ["loose stool","diarrhea"],["watery stool","diarrhea"],["watery motions","diarrhea"],
  ["constipation","constipation"],["hard stool","constipation"],
  ["indigestion","indigestion"],["upset stomach","indigestion"],
  ["acidity","acidity"],["heartburn","acidity"],["acid reflux","acidity"],
  ["bloating","bloating"],["stomach bloated","bloating"],["gas","bloating"],
  ["stomach pain","stomach pain"],["abdominal pain","stomach pain"],
  ["belly pain","stomach pain"],["tummy pain","stomach pain"],
  ["back pain","back pain"],["lower back pain","back pain"],["backache","back pain"],
  ["neck pain","neck pain"],["stiff neck","stiff neck"],["neck stiffness","stiff neck"],
  ["knee pain","knee pain"],["joint pain","joint pain"],["swollen joints","swollen joints"],
  ["muscle pain","muscle pain"],["muscle ache","muscle pain"],
  ["body ache","muscle pain"],["body pain","muscle pain"],
  ["headache","headache"],["head ache","headache"],["head pain","headache"],
  ["migraine","migraine"],["severe headache","migraine"],
  ["cough","cough"],["dry cough","dry cough"],["wet cough","productive cough"],
  ["phlegm","phlegm"],["mucus","phlegm"],["sputum","phlegm"],
  ["fatigue","fatigue"],["very tired","fatigue"],["tired","fatigue"],
  ["exhaustion","fatigue"],["no energy","fatigue"],["lethargy","fatigue"],
  ["weakness","weakness"],["weak","weakness"],["feeling weak","weakness"],
  ["numbness","numbness"],["numb","numbness"],["no feeling in","numbness"],
  ["tingling","tingling"],["pins and needles","tingling"],
  ["red eyes","red eyes"],["pink eyes","red eyes"],["watery eyes","watery eyes"],
  ["mouth sores","mouth sores"],["ulcers in mouth","mouth sores"],["tongue sores","mouth sores"],
  ["malaise","malaise"],["generally unwell","malaise"],["feeling sick","malaise"],
  ["not feeling well","malaise"],["under the weather","malaise"],
  ["sneezing","sneezing"],["sneezes","sneezing"],
  // Telugu
  ["జ్వరం","fever"],["అధిక జ్వరం","high fever"],["తక్కువ జ్వరం","mild fever"],
  ["దగ్గు","cough"],["పొడి దగ్గు","dry cough"],["తలనొప్పి","headache"],
  ["వాంతి","vomiting"],["వికారం","nausea"],["విరేచనాలు","diarrhea"],
  ["మలబద్ధకం","constipation"],["కడుపు నొప్పి","stomach pain"],
  ["పొట్ట నొప్పి","stomach pain"],["పొట్ట ఉబ్బరం","bloating"],
  ["నీరసం","fatigue"],["అలసట","fatigue"],["బలహీనత","weakness"],
  ["శరీర నొప్పి","muscle pain"],["వళ్ళు నొప్పి","muscle pain"],
  ["కీళ్ళ నొప్పి","joint pain"],["వెన్నునొప్పి","back pain"],
  ["మోకాలు నొప్పి","knee pain"],["మెడ నొప్పి","neck pain"],
  ["మూత్రవిసర్జన తరచుగా","frequent urination"],["మూత్రంలో మంట","burning urination"],
  ["దాహం","excessive thirst"],["అతిగా దాహం","excessive thirst"],
  ["దద్దుర్లు","skin rash"],["దురద","itching"],["గజ్జి","itching"],
  ["శ్వాస ఆడటం లేదు","breathlessness"],["ఊపిరి అందడం లేదు","breathlessness"],
  ["ఛాతీ నొప్పి","chest pain"],["గుండె నొప్పి","chest pain"],
  ["చలి","chills"],["వణుకు","shivering"],["చెమట","sweating"],
  ["బరువు తగ్గడం","weight loss"],["బరువు పెరగడం","weight gain"],
  ["ఆకలి లేకపోవడం","loss of appetite"],["అతిగా ఆకలి","excessive hunger"],
  ["పసుపు కళ్ళు","yellow eyes"],["పసుపు చర్మం","yellow skin"],
  ["చీకటి మూత్రం","dark urine"],["రక్తపు మూత్రం","blood in urine"],
  ["జలుబు","runny nose"],["ముక్కు మూసుకుపోవడం","nasal congestion"],
  ["గొంతు నొప్పి","sore throat"],["చెవి నొప్పి","ear pain"],
  ["గుండె దడ","palpitations"],["మైకం","dizziness"],["కళ్ళు తిరగడం","dizziness"],
  ["మూర్ఛ","seizures"],["మతిమరుపు","memory loss"],
  ["వాపు","swelling"],["కాళ్ళు వాపు","swollen legs"],
  ["నిద్రలేమి","sleep disturbance"],["ఆందోళన","anxiety"],
  ["నిరాశ","depression"],["చిరాకు","irritability"],
  ["రక్తస్రావం","blood in stool"],["మలంలో రక్తం","blood in stool"],
  ["తలనొప్పి","headache"],["నొప్పి","pain"],
  // Hindi
  ["तेज बुखार","high fever"],["हल्का बुखार","mild fever"],["बुखार","fever"],
  ["सांस की तकलीफ","breathlessness"],["सांस फूलना","breathlessness"],
  ["सांस लेने में दिक्कत","breathlessness"],
  ["सीने में दर्द","chest pain"],["सीने में जकड़न","chest tightness"],
  ["सिरदर्द","headache"],["सर दर्द","headache"],
  ["खांसी","cough"],["सूखी खांसी","dry cough"],["खून वाली खांसी","blood in sputum"],
  ["उल्टी","vomiting"],["उल्टी जैसा","nausea"],["जी मिचलाना","nausea"],["मतली","nausea"],
  ["दस्त","diarrhea"],["पतले दस्त","diarrhea"],["पानी जैसे दस्त","diarrhea"],
  ["कब्ज","constipation"],["पेट दर्द","stomach pain"],["पेट में दर्द","stomach pain"],
  ["पेट फूलना","bloating"],["गैस","bloating"],["एसिडिटी","acidity"],["सीने में जलन","acidity"],
  ["कमर दर्द","back pain"],["पीठ दर्द","back pain"],
  ["गर्दन दर्द","neck pain"],["गर्दन अकड़न","stiff neck"],
  ["जोड़ों का दर्द","joint pain"],["घुटने में दर्द","knee pain"],
  ["बदन दर्द","muscle pain"],["शरीर में दर्द","muscle pain"],
  ["थकान","fatigue"],["थकावट","fatigue"],["बहुत थकान","fatigue"],
  ["कमजोरी","weakness"],["कमज़ोर","weakness"],
  ["बार बार पेशाब","frequent urination"],["पेशाब में जलन","burning urination"],
  ["ज्यादा प्यास","excessive thirst"],["बहुत प्यास","excessive thirst"],
  ["धुंधली दृष्टि","blurred vision"],["आंखें पीली","yellow eyes"],
  ["त्वचा पीली","yellow skin"],["पीलिया","yellow skin"],
  ["गहरा पेशाब","dark urine"],["खून वाला पेशाब","blood in urine"],
  ["खुजली","itching"],["चकत्ते","skin rash"],["दाने","skin rash"],
  ["सूजन","swelling"],["पैरों में सूजन","swollen legs"],["चेहरे पर सूजन","puffy face"],
  ["ठंड लगना","chills"],["कंपकंपी","shivering"],["पसीना","sweating"],["रात को पसीना","night sweats"],
  ["वजन कम होना","weight loss"],["वजन बढ़ना","weight gain"],
  ["भूख नहीं","loss of appetite"],["ज्यादा भूख","excessive hunger"],
  ["नाक बहना","runny nose"],["नाक बंद","nasal congestion"],
  ["गले में दर्द","sore throat"],["गला खराब","throat irritation"],
  ["कान में दर्द","ear pain"],["सुनाई न देना","hearing loss"],
  ["दिल की धड़कन","palpitations"],["धड़कन तेज","palpitations"],
  ["चक्कर","dizziness"],["सिर चकराना","dizziness"],
  ["मिर्गी","seizures"],["दौरे","seizures"],["बेहोशी","fainting"],
  ["याददाश्त कमज़ोर","memory loss"],["भ्रम","confusion"],
  ["नींद नहीं","sleep disturbance"],["अनिद्रा","sleep disturbance"],
  ["चिंता","anxiety"],["घबराहट","anxiety"],["उदासी","depression"],
  ["चिड़चिड़ापन","irritability"],["मूड बदलना","mood swings"],
  ["मुंह में छाले","mouth sores"],["बाल झड़ना","hair loss"],
  ["सुन्नपन","numbness"],["झुनझुनाहट","tingling"],
  ["मलाशय से खून","blood in stool"],["खूनी दस्त","blood in stool"],
].sort((a, b) => b[0].length - a[0].length);

// Extract canonical symptom chips from any free text sentence
function extractSymptoms(text) {
  if (!text || !text.trim()) return [];
  const lower = text.toLowerCase();
  const found = new Map();
  for (const [phrase, canonical] of SYMPTOM_NLP) {
    if (lower.includes(phrase.toLowerCase())) {
      found.set(canonical, true);
    }
  }
  return [...found.keys()];
}

// ── Main Component ────────────────────────────────────────────────────────────
function MainApp() {
  const { user, logoutUser } = useAuth();
  const [screen, setScreen]     = useState("home");
  const [lang, setLang]         = useState(user?.language || "te");
  const [symText, setSymText]   = useState("");   // raw typed text
  const [chips, setChips]       = useState([]);   // extracted symptom chips
  const [voiceLabel, setVoiceLabel] = useState("");
  const [results, setResults]   = useState(null);
  const [history, setHistory]   = useState([]);
  const [histLoading, setHistLoading] = useState(false);
  const [doctors, setDoctors]   = useState([]);
  const [docLoading, setDocLoading]   = useState(false);
  const [stats, setStats]       = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [error, setError]       = useState("");
  const [tip] = useState(TIPS[Math.floor(Math.random() * TIPS.length)]);
  const recRef   = useRef(null);
  const timerRef = useRef(null);  // debounce timer
  const t = UI[lang];

  // ── onChange: update text immediately, debounce chip extraction 400ms ────────
  const onType = (e) => {
    const val = e.target.value;
    setSymText(val);                        // update text state — no cursor issue
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {   // extract chips after user pauses typing
      setChips(extractSymptoms(val));
    }, 400);
  };

  const removeChip = (chip) => setChips(prev => prev.filter(c => c !== chip));

  const addQuick = (s) => {
    const newText = symText ? symText + ", " + s : s;
    setSymText(newText);
    clearTimeout(timerRef.current);
    setChips(extractSymptoms(newText));
  };

  const clearAll = () => {
    setSymText(""); setChips([]); setVoiceLabel("");
  };

  const goTo = async (s) => {
    // Clear diagnosis state when navigating away from results or to check
    if (s === "check") { clearAll(); setResults(null); }
    setScreen(s);
    if (s === "history" && user) {
      setHistLoading(true);
      try { const r = await getHistory(); setHistory(r.data.records || []); } catch(_){}
      setHistLoading(false);
    }
    if (s === "doctors") {
      setDocLoading(true);
      setDoctors([]);

      const loadDoctors = async (lat, lng) => {
        try {
          const r = await getNearbyDoctors(lat, lng);
          const list = r.data.doctors || [];
          setDoctors(list.length > 0 ? list : FALLBACK_DOCTORS);
        } catch (err) {
          // Backend down — show hardcoded list
          setDoctors(FALLBACK_DOCTORS);
        }
        setDocLoading(false);
      };

      if (!navigator.geolocation) {
        loadDoctors(null, null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => loadDoctors(pos.coords.latitude, pos.coords.longitude),
        ()    => loadDoctors(null, null),  // denied — still load all
        { timeout: 8000, enableHighAccuracy: false, maximumAge: 60000 }
      );
    }
    if (s === "home" && user) { try { const r = await getStats(); setStats(r.data); } catch(_){} }
  };

  const changeLang = async (l) => { setLang(l); if (user) { try { await updateLang(l); } catch(_){} } };

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Voice not supported. Please type symptoms."); return; }
    if (isListening) { recRef.current?.stop(); return; }
    const r = new SR();
    recRef.current = r;
    r.continuous = false; r.interimResults = false;
    r.lang = lang === "te" ? "te-IN" : lang === "hi" ? "hi-IN" : "en-IN";
    r.onstart  = () => { setIsListening(true); setVoiceLabel(""); };
    r.onresult = (e) => {
      const transcript = Array.from(e.results).map(x => x[0].transcript).join(" ");
      setVoiceLabel(transcript);
      const newText = symText ? symText + " " + transcript : transcript;
      setSymText(newText);
      setChips(extractSymptoms(newText));
      setIsListening(false);
    };
    r.onerror = () => setIsListening(false);
    r.onend   = () => setIsListening(false);
    r.start();
  };

  const handlePredict = async () => {
    const query = chips.length > 0 ? chips.join(", ") : symText;
    if (!query.trim()) return;
    setError(""); setIsPredicting(true);
    try {
      const r = await predict(query, lang);
      setResults(r.data);
      setScreen("results");

      // Explicitly save record as backup (in case predict route missed it)
      if (user) {
        try {
          await saveRecord({
            symptoms:         query,
            language:         lang,
            predictions:      r.data.predictions     || [],
            matched_symptoms: r.data.matched_symptoms || [],
            emergency:        r.data.emergency        || false,
          });
        } catch(_) {}
        try { const s = await getStats(); setStats(s.data); } catch(_) {}
      }

    } catch {
      // Backend offline — use local prediction
      const local = matchDiseases(symText + " " + chips.join(" "));
      if (local.length > 0) {
        setResults({ predictions: local, matched_symptoms: chips.length > 0 ? chips : local[0]?.matched || [], emergency: local[0]?.sev === "high", offline: true });
        setScreen("results");
      } else {
        setError("Cannot connect to server. Check backend on port 5000.");
      }
    } finally { setIsPredicting(false); }
  };

  const handleDelete = async (id) => {
    try { await deleteRecord(id); setHistory(h => h.filter(r => r._id !== id)); } catch(_){}
  };

  const cs = { padding:"0 20px 24px", animation:"fadeIn .35s ease" };

  // Hardcoded fallback doctors shown when backend is unreachable
  const FALLBACK_DOCTORS = [
    { name:"PHC Uppal",                   type:"Government PHC",          phone:"104",        village:"Uppal",      district:"Hyderabad",          isGovernment:true,  isOpen:true },
    { name:"CHC Medchal",                 type:"Community Health Centre", phone:"104",        village:"Medchal",    district:"Medchal-Malkajgiri", isGovernment:true,  isOpen:true },
    { name:"Dr. Ramaiah Clinic",          type:"General Physician",       phone:"9876543210", village:"Boduppal",   district:"Hyderabad",          isGovernment:false, isOpen:true },
    { name:"Area Hospital Nizamabad",     type:"Government Hospital",     phone:"104",        village:"Nizamabad",  district:"Nizamabad",          isGovernment:true,  isOpen:true },
    { name:"PHC Warangal",                type:"Government PHC",          phone:"104",        village:"Warangal",   district:"Warangal",           isGovernment:true,  isOpen:true },
    { name:"District Hospital Guntur",    type:"Government Hospital",     phone:"104",        village:"Guntur",     district:"Guntur",             isGovernment:true,  isOpen:true },
    { name:"PHC Vijayawada",              type:"Government PHC",          phone:"104",        village:"Vijayawada", district:"Krishna",            isGovernment:true,  isOpen:true },
    { name:"District Hospital Karimnagar",type:"Government Hospital",     phone:"104",        village:"Karimnagar", district:"Karimnagar",         isGovernment:true,  isOpen:true },
  ];
  const QUICK = {
    en: ["fever","cough","headache","vomiting","fatigue","stomach pain","chills","itching","breathlessness","chest pain","dizziness","body ache","diarrhea","weakness","nausea","sore throat","runny nose","joint pain","back pain","rash"],
    te: ["జ్వరం","దగ్గు","తలనొప్పి","వాంతి","అలసట","కడుపు నొప్పి","చలి","దురద","శ్వాస ఆడటం లేదు","ఛాతీ నొప్పి","మైకం","వళ్ళు నొప్పి","విరేచనాలు","బలహీనత","వికారం","గొంతు నొప్పి","జలుబు","కీళ్ళ నొప్పి"],
    hi: ["बुखार","खांसी","सिरदर्द","उल्टी","थकान","पेट दर्द","ठंड","खुजली","सांस की तकलीफ","सीने में दर्द","चक्कर","बदन दर्द","दस्त","कमजोरी","मतली","गले में दर्द","नाक बहना","जोड़ों का दर्द"],
  };

  // ════════════════════════════════════════════════════════════════════════════
  // HOME SCREEN
  // ════════════════════════════════════════════════════════════════════════════
  const HomeScreen = () => (
    <div style={cs}>
      <div style={{ background:"linear-gradient(135deg,#064e3b,#047857)", borderRadius:22, padding:"28px 22px", marginBottom:18, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute",top:-30,right:-30,width:140,height:140,background:"rgba(255,255,255,0.05)",borderRadius:"50%" }}/>
        <div style={{ fontSize:52, marginBottom:8 }}>🏥</div>
        <div style={{ color:"#fff",fontSize:22,fontWeight:800 }}>{user ? `${lang==="te" ? "నమస్తే" : lang==="hi" ? "नमस्ते" : "Hello"}, ${user.name.split(" ")[0]}! 👋` : t.title}</div>
        <div style={{ color:"#6ee7b7",fontSize:13,marginTop:3 }}>{t.tag}</div>
        {user?.village && <div style={{ color:"#a7f3d0",fontSize:12,marginTop:2 }}>📍 {user.village}</div>}
        <button onClick={() => goTo("check")} style={{ marginTop:18,background:"#10b981",color:"#fff",border:"none",borderRadius:14,padding:"13px 0",fontSize:15,fontWeight:700,cursor:"pointer",width:"100%" }}>
          🩺 {lang==="te"?"లక్షణాలు చెప్పండి":lang==="hi"?"लक्षण बताएं":"Check Symptoms Now"}
        </button>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16 }}>
        {[["tel:108","🚑","108","Emergency Ambulance","#fef2f2","#fecaca","#dc2626","#991b1b"],["tel:104","📞","104","Health Helpline","#eff6ff","#bfdbfe","#2563eb","#1e40af"]].map(([href,icon,num,label,bg,border,clr,clr2]) => (
          <a key={num} href={href} style={{ background:bg,border:`2px solid ${border}`,borderRadius:14,padding:"14px 10px",textAlign:"center",textDecoration:"none",display:"block" }}>
            <div style={{ fontSize:26 }}>{icon}</div>
            <div style={{ color:clr,fontWeight:800,fontSize:22 }}>{num}</div>
            <div style={{ color:clr2,fontSize:11 }}>{label}</div>
          </a>
        ))}
      </div>
      {user && stats && (
        <div style={{ background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:16,padding:"16px 18px",marginBottom:14 }}>
          <div style={{ color:"#065f46",fontWeight:700,fontSize:14,marginBottom:10 }}>📊 Your Health Summary</div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6 }}>
            {[["🔍",stats.total,"Total"],["💚",stats.mild,"Mild"],["🟡",stats.moderate,"Moderate"],["🔴",stats.serious,"Serious"]].map(([icon,val,lbl]) => (
              <div key={lbl} style={{ textAlign:"center",background:"#fff",borderRadius:10,padding:"8px 2px" }}>
                <div style={{ fontSize:16 }}>{icon}</div>
                <div style={{ fontSize:18,fontWeight:700,color:"#064e3b" }}>{val}</div>
                <div style={{ fontSize:10,color:"#6b7280" }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {!user && (
        <div style={{ background:"#fffbeb",border:"1px solid #fde68a",borderRadius:16,padding:16,textAlign:"center",marginBottom:14 }}>
          <div style={{ fontSize:28,marginBottom:6 }}>🔐</div>
          <div style={{ color:"#92400e",fontWeight:700,fontSize:14,marginBottom:4 }}>Save Your Health History</div>
          <div style={{ color:"#78350f",fontSize:12,marginBottom:12 }}>Create free account to track all your checkups</div>
          <button onClick={() => setScreen("auth")} style={{ background:"#064e3b",color:"#fff",border:"none",borderRadius:10,padding:"10px 24px",fontSize:14,fontWeight:700,cursor:"pointer" }}>Register Free</button>
        </div>
      )}
      <div style={{ background:"#f0f9ff",border:"1px solid #bae6fd",borderRadius:14,padding:"14px 16px" }}>
        <div style={{ color:"#0369a1",fontWeight:700,fontSize:13,marginBottom:4 }}>💡 Health Tip of the Day</div>
        <div style={{ color:"#0c4a6e",fontSize:13 }}>{tip}</div>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // DIAGNOSE SCREEN — simple controlled textarea, debounced chip extraction
  // ════════════════════════════════════════════════════════════════════════════
  const DiagnoseScreen = () => {
    const quickList = QUICK[lang] || QUICK.en;
    const placeholder = lang === "te" ? "ఉదా: జ్వరం, తలనొప్పి, వళ్ళు నొప్పి..." : lang === "hi" ? "जैसे: बुखार, सिरदर्द, बदन दर्द..." : "e.g. fever, headache, body ache, feeling tired...";

    return (
      <div style={cs}>
        <div style={{ color:"#064e3b",fontSize:20,fontWeight:800,marginBottom:3 }}>
          {lang==="te"?"లక్షణాలు వివరించండి":lang==="hi"?"लक्षण बताएं":"Describe Symptoms"}
        </div>
        <div style={{ color:"#6b7280",fontSize:13,marginBottom:14 }}>
          {lang==="te"?"వాక్యాలలో స్వేచ్ఛగా రాయండి":lang==="hi"?"स्वतंत्र रूप से लिखें":"Type or speak freely — symptoms detected automatically"}
        </div>

        {/* Language tabs */}
        <div style={{ display:"flex",gap:8,marginBottom:14 }}>
          {[["en","English"],["te","తెలుగు"],["hi","हिंदी"]].map(([c,l]) => (
            <button key={c} onClick={() => changeLang(c)}
              style={{ flex:1,padding:"9px 4px",borderRadius:10,border:`2px solid ${lang===c?"#064e3b":"#e5e7eb"}`,background:lang===c?"#064e3b":"#fff",color:lang===c?"#fff":"#374151",fontSize:13,fontWeight:600,cursor:"pointer" }}>{l}
            </button>
          ))}
        </div>

        {/* Voice button */}
        <div onClick={startVoice}
          style={{ display:"flex",alignItems:"center",gap:14,marginBottom:14,background:isListening?"#fef2f2":"#f0fdf4",borderRadius:16,padding:"12px 16px",border:`2px solid ${isListening?"#fca5a5":"#bbf7d0"}`,cursor:"pointer" }}>
          <div style={{ width:50,height:50,flexShrink:0,borderRadius:"50%",background:isListening?"#dc2626":"#064e3b",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22 }}>
            {isListening ? "⏹" : "🎙️"}
          </div>
          <div>
            <div style={{ fontWeight:700,fontSize:13,color:isListening?"#dc2626":"#065f46" }}>
              {isListening ? (lang==="te"?"వింటోంది...":lang==="hi"?"सुन रहा हूं...":"Listening...") : voiceLabel ? "✅ Voice captured!" : (lang==="te"?"మాట్లాడటానికి నొక్కండి":lang==="hi"?"बोलने के लिए दबाएं":"Tap to speak")}
            </div>
            {voiceLabel && <div style={{ color:"#6b7280",fontSize:11,marginTop:2,fontStyle:"italic" }}>"{voiceLabel.slice(0,50)}{voiceLabel.length>50?"...":""}"</div>}
            {!voiceLabel && !isListening && <div style={{ color:"#9ca3af",fontSize:11,marginTop:2 }}>{lang==="te"?"వాక్యాలలో చెప్పవచ్చు":lang==="hi"?"वाक्यों में बोलें":"Speak in full sentences"}</div>}
          </div>
        </div>

        {/* THE TEXTAREA — simple controlled, just works */}
        <textarea
          value={symText}
          onChange={onType}
          placeholder={placeholder}
          rows={5}
          style={{ width:"100%",borderRadius:14,border:"2px solid #d1fae5",padding:"14px 16px",fontSize:15,fontFamily:"'Noto Sans Telugu','Noto Sans Devanagari',system-ui,sans-serif",resize:"vertical",outline:"none",boxSizing:"border-box",background:"#fff",lineHeight:1.8,color:"#111827",marginBottom:10,display:"block" }}
        />

        {/* Detected chips */}
        {chips.length > 0 && (
          <div style={{ marginBottom:14,background:"#f0fdf4",borderRadius:14,padding:"12px 14px",border:"1px solid #6ee7b7" }}>
            <div style={{ color:"#065f46",fontSize:12,fontWeight:700,marginBottom:8 }}>
              ✅ {lang==="te"?"గుర్తించిన లక్షణాలు":lang==="hi"?"पहचाने गए लक्षण":"Detected"} ({chips.length}):
            </div>
            <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
              {chips.map(chip => (
                <span key={chip} style={{ background:"#064e3b",color:"#fff",borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:600,display:"inline-flex",alignItems:"center",gap:6 }}>
                  {chip}
                  <span onClick={() => removeChip(chip)} style={{ cursor:"pointer",opacity:.7,fontSize:11 }}>✕</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Quick add */}
        <div style={{ marginBottom:16 }}>
          <div style={{ color:"#9ca3af",fontSize:11,fontWeight:600,marginBottom:7 }}>
            {lang==="te"?"త్వరగా యాడ్ చేయండి:":lang==="hi"?"जल्दी जोड़ें:":"Quick add:"}
          </div>
          <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
            {quickList.map(s => (
              <button key={s} onClick={() => addQuick(s)}
                style={{ background:"#fff",border:"1.5px solid #d1fae5",borderRadius:20,padding:"5px 13px",fontSize:12,cursor:"pointer",color:"#065f46",fontFamily:"'Noto Sans Telugu','Noto Sans Devanagari',system-ui" }}>
                + {s}
              </button>
            ))}
          </div>
        </div>

        {symText.length > 0 && (
          <button onClick={clearAll} style={{ background:"none",border:"none",color:"#9ca3af",fontSize:12,cursor:"pointer",marginBottom:10,textDecoration:"underline" }}>
            Clear all
          </button>
        )}

        {error && <div style={{ background:"#fef2f2",border:"1px solid #fecaca",color:"#dc2626",padding:"10px 14px",borderRadius:10,fontSize:13,marginBottom:12 }}>⚠️ {error}</div>}

        <button onClick={handlePredict} disabled={!symText.trim() && chips.length===0 || isPredicting}
          style={{ width:"100%",background:(symText.trim()||chips.length>0)?"linear-gradient(135deg,#064e3b,#047857)":"#d1d5db",color:"#fff",border:"none",borderRadius:14,padding:16,fontSize:16,fontWeight:700,cursor:(symText.trim()||chips.length>0)?"pointer":"default",transition:"all .3s",opacity:isPredicting?.75:1 }}>
          {isPredicting ? "🔍 Analyzing..." : "🩺 "+t.btn}
        </button>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════════════════════
  // RESULTS SCREEN
  // ════════════════════════════════════════════════════════════════════════════
  const ResultsScreen = () => {
    const preds = results?.predictions || [];
    return (
      <div style={cs}>
        <div style={{ color:"#064e3b",fontSize:20,fontWeight:800,marginBottom:3 }}>{t.result}</div>
        {results?.offline && <div style={{ background:"#fffbeb",border:"1px solid #fde68a",color:"#92400e",padding:"8px 14px",borderRadius:10,fontSize:12,marginBottom:10 }}>⚠️ Offline mode — start backend for full accuracy</div>}
        {(chips.length > 0 || results?.matched_symptoms?.length > 0) && (
          <div style={{ background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:12,padding:"10px 14px",marginBottom:14,fontSize:12,color:"#065f46" }}>
            ✅ {t.detected}: <b>{(chips.length > 0 ? chips : results?.matched_symptoms||[]).slice(0,6).join(", ")}</b>
          </div>
        )}
        {preds.length === 0 ? (
          <div style={{ textAlign:"center",padding:40,color:"#6b7280" }}>
            <div style={{ fontSize:52 }}>🤔</div>
            <div style={{ marginTop:12,fontSize:15 }}>Could not identify. Please consult a doctor.</div>
            <a href="tel:104" style={{ display:"inline-block",marginTop:16,background:"#064e3b",color:"#fff",padding:"12px 28px",borderRadius:12,textDecoration:"none",fontWeight:700 }}>📞 Call 104</a>
          </div>
        ) : preds.map((r,i) => {
          // ── Normalise field names from both ML service and local fallback ──
          const name       = r.disease    || r.name     || "Unknown";
          const emoji      = r.emoji      || r.e        || "🩺";
          const sev        = r.severity   || r.sev      || "mild";
          const confidence = r.confidence || 0;
          const advice     = r.advice     || r.a        || "";
          const telugu     = r.telugu     || r.te       || name;
          const hindi      = r.hindi      || r.hi       || name;
          const matched    = r.matched_symptoms || r.matched || [];
          const sevColor   = SEV[sev] || "#6b7280";

          return (
          <div key={i} style={{ background:"#fff",border:`2px solid ${i===0?"#064e3b":"#e5e7eb"}`,borderRadius:20,padding:18,marginBottom:14,boxShadow:i===0?"0 4px 24px rgba(6,78,59,0.13)":"none" }}>
            {i===0 && <div style={{ background:"#064e3b",color:"#fff",fontSize:11,fontWeight:700,padding:"3px 12px",borderRadius:20,display:"inline-block",marginBottom:10 }}>⭐ MOST LIKELY</div>}
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:36 }}>{emoji}</div>
                <div style={{ fontWeight:800,fontSize:18,color:"#111827",marginTop:4 }}>{name}</div>
                <div style={{ color:"#6b7280",fontSize:13 }}>{lang==="te"?telugu:lang==="hi"?hindi:name}</div>
              </div>
              <div style={{ textAlign:"right",flexShrink:0,marginLeft:12 }}>
                <div style={{ background:sevColor+"20",color:sevColor,padding:"4px 12px",borderRadius:20,fontSize:12,fontWeight:700 }}>
                  {sev==="mild"?t.mild:sev==="moderate"?t.moderate:t.serious}
                </div>
                <div style={{ color:"#064e3b",fontWeight:800,fontSize:26,marginTop:6 }}>{confidence}%</div>
                <div style={{ color:"#9ca3af",fontSize:11 }}>{t.match}</div>
              </div>
            </div>
            <div style={{ background:"#f3f4f6",borderRadius:6,height:8,margin:"12px 0 4px" }}>
              <div style={{ background:sevColor,borderRadius:6,height:8,width:`${confidence}%`,transition:"width 1.2s ease" }}/>
            </div>
            {matched.length > 0 && <div style={{ color:"#6b7280",fontSize:11,marginTop:6 }}>Matched: {matched.slice(0,5).join(", ")}</div>}
            <div style={{ marginTop:12,background:"#f0fdf4",borderRadius:12,padding:"12px 14px" }}>
              <div style={{ color:"#065f46",fontWeight:700,fontSize:13,marginBottom:5 }}>💊 {t.advice}</div>
              <div style={{ color:"#374151",fontSize:13,lineHeight:1.7 }}>{advice}</div>
            </div>
            {sev==="high" && <a href="tel:108" style={{ display:"block",marginTop:10,background:"#dc2626",color:"#fff",borderRadius:12,padding:11,textAlign:"center",textDecoration:"none",fontWeight:700,fontSize:14 }}>🚑 Go to Hospital — Call 108</a>}
          </div>
          );
        })}
        {results?.emergency && (
          <div style={{ background:"#fef2f2",border:"2px solid #fca5a5",borderRadius:14,padding:14,textAlign:"center",marginBottom:12 }}>
            <div style={{ fontSize:28 }}>⚠️</div>
            <div style={{ color:"#dc2626",fontWeight:700,fontSize:15,marginTop:4 }}>{t.emergency}</div>
          </div>
        )}
        <button onClick={() => goTo("doctors")} style={{ width:"100%",background:"#eff6ff",border:"2px solid #bfdbfe",color:"#1d4ed8",borderRadius:14,padding:14,fontSize:15,fontWeight:700,cursor:"pointer",marginBottom:10 }}>📍 {t.findDoctors}</button>
        <button onClick={() => { clearAll(); setResults(null); setScreen("check"); }} style={{ width:"100%",background:"#f9fafb",border:"2px solid #e5e7eb",color:"#374151",borderRadius:14,padding:14,fontSize:15,fontWeight:700,cursor:"pointer" }}>🔄 {t.checkAgain}</button>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════════════════════
  // DOCTORS SCREEN
  // ════════════════════════════════════════════════════════════════════════════
  const DoctorsScreen = () => (
    <div style={cs}>
      <div style={{ color:"#064e3b",fontSize:20,fontWeight:800,marginBottom:3 }}>{t.doctors}</div>
      <div style={{ color:"#6b7280",fontSize:13,marginBottom:14 }}>Govt hospitals & clinics near you</div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14 }}>
        <a href="tel:108" style={{ background:"#fef2f2",border:"2px solid #fecaca",borderRadius:14,padding:14,textAlign:"center",textDecoration:"none" }}>
          <div style={{ fontSize:28 }}>🚑</div><div style={{ color:"#dc2626",fontWeight:800,fontSize:24 }}>108</div><div style={{ color:"#991b1b",fontSize:11 }}>Emergency Ambulance</div>
        </a>
        <a href="tel:104" style={{ background:"#eff6ff",border:"2px solid #bfdbfe",borderRadius:14,padding:14,textAlign:"center",textDecoration:"none" }}>
          <div style={{ fontSize:28 }}>📞</div><div style={{ color:"#2563eb",fontWeight:800,fontSize:24 }}>104</div><div style={{ color:"#1e40af",fontSize:11 }}>Health Helpline (Free)</div>
        </a>
      </div>
      {docLoading ? (
        <div style={{ textAlign:"center",padding:40,color:"#6b7280" }}>📍 Finding doctors near you...</div>
      ) : doctors.length === 0 ? (
        <div style={{ textAlign:"center",padding:30,background:"#f9fafb",borderRadius:16,color:"#6b7280" }}>
          <div style={{ fontSize:40,marginBottom:8 }}>📍</div>
          <div style={{ marginBottom:6, fontWeight:600, color:"#374151" }}>No doctors found nearby</div>
          <div style={{ fontSize:12, marginBottom:12 }}>Make sure backend is running and MongoDB is connected</div>
          <div style={{ fontSize:12 }}>Or call 104 for nearest govt hospital info</div>
        </div>
      ) : doctors.map((d,i) => (
        <div key={i} style={{ background:"#fff",border:"1px solid #e5e7eb",borderRadius:16,padding:16,marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4 }}>
              <div style={{ width:9,height:9,borderRadius:"50%",background:d.isOpen?"#22c55e":"#9ca3af",flexShrink:0 }}/>
              <span style={{ fontWeight:700,fontSize:14,color:"#111827" }}>{d.name}</span>
            </div>
            <div style={{ color:"#6b7280",fontSize:12 }}>{d.type}{d.village?" • "+d.village:""}</div>
            {d.isGovernment && <div style={{ color:"#059669",fontSize:11,marginTop:2 }}>🏛️ Government — Free Treatment</div>}
          </div>
          <a href={`tel:${d.phone}`} style={{ background:"#064e3b",color:"#fff",borderRadius:10,padding:"9px 14px",fontSize:13,fontWeight:700,textDecoration:"none",whiteSpace:"nowrap",marginLeft:10 }}>📞 Call</a>
        </div>
      ))}
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // HISTORY SCREEN
  // ════════════════════════════════════════════════════════════════════════════
  const HistoryScreen = () => (
    <div style={cs}>
      <div style={{ color:"#064e3b",fontSize:20,fontWeight:800,marginBottom:3 }}>{t.history}</div>
      {!user ? (
        <div style={{ textAlign:"center",padding:50,color:"#6b7280" }}>
          <div style={{ fontSize:52 }}>🔒</div>
          <div style={{ marginTop:12,fontSize:15 }}>Login to view your health history</div>
          <button onClick={() => setScreen("auth")} style={{ marginTop:16,background:"#064e3b",color:"#fff",border:"none",borderRadius:12,padding:"12px 28px",cursor:"pointer",fontWeight:700,fontSize:15 }}>Login / Register</button>
        </div>
      ) : histLoading ? (
        <div style={{ textAlign:"center",padding:40,color:"#6b7280" }}>Loading your records...</div>
      ) : history.length === 0 ? (
        <div style={{ textAlign:"center",padding:50,color:"#6b7280" }}>
          <div style={{ fontSize:52 }}>📋</div>
          <div style={{ marginTop:12 }}>{t.noHistory}</div>
          <button onClick={() => goTo("check")} style={{ marginTop:16,background:"#064e3b",color:"#fff",border:"none",borderRadius:12,padding:"12px 28px",cursor:"pointer",fontWeight:700 }}>Start First Checkup</button>
        </div>
      ) : history.map((rec,i) => (
        <div key={i} style={{ background:"#fff",border:"1px solid #e5e7eb",borderRadius:16,padding:16,marginBottom:10 }}>
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
            <div style={{ color:"#6b7280",fontSize:12 }}>📅 {new Date(rec.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</div>
            <button onClick={() => handleDelete(rec._id)} style={{ background:"none",border:"none",cursor:"pointer",color:"#9ca3af",fontSize:18 }}>🗑️</button>
          </div>
          <div style={{ color:"#374151",fontSize:13,marginBottom:8,fontStyle:"italic" }}>"{rec.symptomsText?.slice(0,80)}{rec.symptomsText?.length>80?"...":""}"</div>
          <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
            {rec.predictions?.slice(0,3).map((r,j) => (
              <span key={j} style={{ background:SEV[r.severity]+"15",color:SEV[r.severity],border:`1px solid ${SEV[r.severity]}30`,borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:600 }}>
                {r.emoji} {r.disease}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  if (screen === "auth") return <AuthPage onSuccess={() => setScreen("home")} />;

  return (
    <div style={{ minHeight:"100vh",width:"100%",background:"#f0fdf4",fontFamily:"'Noto Sans Telugu','Noto Sans Devanagari',system-ui,sans-serif",display:"flex",flexDirection:"column" }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box}html,body{margin:0;padding:0}textarea:focus{border-color:#064e3b!important;box-shadow:0 0 0 3px rgba(6,78,59,.1)!important}button:active{opacity:.8}a,button{-webkit-tap-highlight-color:transparent}`}</style>

      {/* Header */}
      <div style={{ background:"#064e3b",padding:"16px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10,boxShadow:"0 2px 12px rgba(0,0,0,0.1)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          <div style={{ fontSize:28 }}>🏥</div>
          <div>
            <div style={{ color:"#fff",fontWeight:800,fontSize:18 }}>{t.title}</div>
            <div style={{ color:"#a7f3d0",fontSize:11 }}>{t.tag}</div>
          </div>
        </div>
        <div style={{ display:"flex",gap:8,alignItems:"center" }}>
          {["en","te","hi"].map(l => (
            <button key={l} onClick={() => changeLang(l)} style={{ background:lang===l?"#10b981":"rgba(255,255,255,0.2)",color:"#fff",border:"none",borderRadius:8,padding:"6px 10px",fontSize:12,fontWeight:700,cursor:"pointer",transition:"all 0.2s" }}>
              {l==="en"?"EN":l==="te"?"తె":"हि"}
            </button>
          ))}
          {user
            ? <button onClick={() => { logoutUser(); setScreen("home"); clearAll(); setResults(null); setChips([]); setSymText(""); }} style={{ background:"rgba(255,255,255,0.2)",color:"#fff",border:"none",borderRadius:8,padding:"6px 12px",fontSize:12,cursor:"pointer",transition:"all 0.2s" }}>👤 {user.name.split(" ")[0]}</button>
            : <button onClick={() => setScreen("auth")} style={{ background:"#10b981",color:"#fff",border:"none",borderRadius:8,padding:"6px 14px",fontSize:12,fontWeight:700,cursor:"pointer",transition:"all 0.2s" }}>{t.login}</button>
          }
        </div>
      </div>

      {/* Content Container */}
      <div style={{ flex:1,overflowY:"auto",display:"flex",justifyContent:"center",alignItems:"flex-start",padding:"24px 16px 100px" }}>
        <div style={{ width:"100%",maxWidth:900 }}>
          {screen==="home"    && <HomeScreen/>}
          {screen==="check"   && <DiagnoseScreen/>}
          {screen==="results" && <ResultsScreen/>}
          {screen==="doctors" && <DoctorsScreen/>}
          {screen==="history" && <HistoryScreen/>}
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{ background:"#fff",borderTop:"2px solid #e5e7eb",display:"flex",padding:"10px 0 12px",position:"fixed",bottom:0,width:"100%",boxShadow:"0 -2px 12px rgba(0,0,0,0.05)" }}>
        {[{id:"home",icon:"🏠",label:t.home},{id:"check",icon:"🩺",label:t.check},{id:"doctors",icon:"📍",label:t.doctors},{id:"history",icon:"📋",label:t.history}].map(item => (
          <button key={item.id} onClick={() => goTo(item.id)} style={{ flex:1,background:"none",border:"none",cursor:"pointer",padding:"8px 4px",display:"flex",flexDirection:"column",alignItems:"center",gap:3,transition:"all 0.2s" }}>
            <div style={{ fontSize:24 }}>{item.icon}</div>
            <div style={{ fontSize:11,color:screen===item.id?"#064e3b":"#9ca3af",fontWeight:screen===item.id?700:400 }}>{item.label}</div>
            {screen===item.id && <div style={{ width:6,height:6,background:"#064e3b",borderRadius:"50%",marginTop:2 }}/>}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return <AuthProvider><MainApp/></AuthProvider>;
}