# SwasthyaVani — ML Service Documentation

## Overview
Multi-class disease classification system trained on **108 diseases** and **158 symptoms**  
covering Telugu, Hindi, and English symptom descriptions.

---

## Dataset

| Property         | Value                          |
|------------------|-------------------------------|
| Diseases         | 108                            |
| Symptoms         | 158                            |
| Training samples | ~10,368 (120 per disease × 3 augmentation levels) |
| Languages        | Telugu, Hindi, English         |
| ICD-10 coded     | Yes (all diseases)             |

### Disease Categories
| Category         | Count |
|------------------|-------|
| Infectious       | 13    |
| Viral            | 13    |
| Bacterial        | 8     |
| Chronic/NCD      | 14    |
| Gastrointestinal | 11    |
| Respiratory      | 5     |
| Neurological     | 6     |
| Mental Health    | 2     |
| Musculoskeletal  | 4     |
| Renal            | 3     |
| Dermatological   | 8     |
| Ophthalmological | 4     |
| ENT              | 3     |
| Reproductive     | 3     |
| Pediatric        | 3     |
| Oncological      | 3     |
| Other            | 5     |

---

## Models Trained

### Model 1: Random Forest Classifier
- **Type**: Ensemble (Bagging)
- **Trees**: 300
- **Max Features**: sqrt
- **Class Weight**: balanced
- **Cross Validation**: 5-fold stratified

### Model 2: XGBoost Classifier
- **Type**: Ensemble (Gradient Boosting)
- **Trees**: 300
- **Max Depth**: 6
- **Learning Rate**: 0.1
- **Subsampling**: 80%

### Model 3: Deep Neural Network (DNN)
- **Framework**: TensorFlow/Keras
- **Architecture**:
  ```
  Input(158)
    → Dense(512, ReLU) + BatchNorm + Dropout(0.4)
    → Dense(256, ReLU) + BatchNorm + Dropout(0.35)
    → Dense(256, ReLU) + BatchNorm + Dropout(0.3)
    → Dense(128, ReLU) + BatchNorm + Dropout(0.25)
    → Dense(64,  ReLU) + BatchNorm + Dropout(0.2)
    → Dense(108, Softmax)
  ```
- **Optimizer**: Adam (lr=5e-4)
- **Loss**: Categorical Cross-Entropy
- **Regularization**: L2(1e-4) + Dropout + BatchNorm
- **Callbacks**: EarlyStopping + ReduceLROnPlateau
- **Class Weights**: Computed (balanced)

---

## Evaluation Metrics

All models are evaluated on:
- **Accuracy** (overall correct predictions)
- **Precision** (weighted average)
- **Recall** (weighted average)
- **F1-Score** (weighted + macro)
- **ROC-AUC** (multi-class OvR, macro average)
- **5-Fold Cross-Validation** (RF and XGBoost)
- **Confusion Matrix**
- **Per-class Classification Report**

---

## How to Run

### Step 1: Install dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Train all 3 models
```bash
python train_model.py
```

This will:
- Build the dataset
- Train Random Forest, XGBoost, and DNN
- Compare all models
- Save the best model automatically
- Generate plots in `results/`

### Step 3: Start Flask API
```bash
python app.py
```
API starts at: **http://localhost:5001**

---

## API Endpoints

| Method | Endpoint      | Description                    |
|--------|---------------|-------------------------------|
| GET    | `/`           | Service info and model details |
| GET    | `/health`     | Health check                   |
| GET    | `/model_info` | Full model comparison results  |
| GET    | `/symptoms`   | List all 158 symptoms          |
| GET    | `/diseases`   | List all 108 diseases          |
| POST   | `/predict`    | Predict disease from symptoms  |

### Predict Example
```bash
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{"symptoms": "fever chills headache vomiting muscle pain"}'
```

Response:
```json
{
  "predictions": [
    {
      "disease": "Malaria",
      "confidence": 87,
      "severity": "high",
      "advice": "Visit doctor immediately...",
      "telugu": "మలేరియా",
      "hindi": "मलेरिया",
      "category": "Infectious",
      "icd10": "B50-B54"
    }
  ],
  "matched_symptoms": ["high_fever", "chills", "headache", "vomiting", "muscle_pain"],
  "emergency": true,
  "model_used": "XGBoost",
  "model_accuracy": 94.23
}
```

---

## Output Files After Training

```
ml-service/
├── model/
│   ├── best_model.pkl          ← best model (or .keras for DNN)
│   ├── rf_model.pkl            ← Random Forest
│   ├── xgb_model.pkl           ← XGBoost
│   ├── dnn_model.keras         ← Deep Neural Network
│   ├── label_encoder.pkl       ← disease label encoder
│   ├── symptoms_list.pkl       ← 158 symptom feature names
│   ├── scaler.pkl              ← StandardScaler for DNN
│   ├── model_meta.json         ← best model info + all results
│   └── disease_meta.json       ← disease advice + translations
└── results/
    ├── model_comparison.png             ← bar chart accuracy
    ├── detailed_metrics_comparison.png  ← all metrics grouped chart
    ├── confusion_matrix_<best>.png      ← confusion matrix heatmap
    ├── dnn_training_history.png         ← loss/accuracy curves
    ├── feature_importance.png           ← top 30 symptoms (RF/XGB)
    ├── model_comparison.csv             ← full results table
    ├── classification_report_Random_Forest.txt
    ├── classification_report_XGBoost.txt
    └── classification_report_DNN.txt
```

---

## For Paper / Research Use

- Dataset: Synthetically generated from clinical symptom-disease mappings
- ICD-10 codes provided for all 108 diseases
- Supports multilingual input (Telugu, Hindi, English)
- Designed for deployment in resource-constrained rural India settings
- Follows WHO disease classification guidelines
- Severity mapped to clinical urgency levels
