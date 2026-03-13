"""
=============================================================================
AI-Assisted Rural Healthcare Diagnosis System
Model Training Pipeline
-----------------------------------------------------------------------------
Models Trained  : 3
  1. Random Forest Classifier      (ensemble / bagging)
  2. XGBoost Classifier            (ensemble / boosting)
  3. Deep Neural Network (DNN)     (TensorFlow / Keras)

Evaluation Metrics (per model):
  - Accuracy, Precision, Recall, F1-Score (macro & weighted)
  - Confusion Matrix
  - ROC-AUC (OvR)
  - Classification Report

Best model is auto-selected and saved for Flask API.
=============================================================================
"""

import os, json, time, warnings
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
import joblib

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                             f1_score, confusion_matrix, classification_report,
                             roc_auc_score)
from sklearn.utils.class_weight import compute_class_weight
import xgboost as xgb
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, BatchNormalization
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.regularizers import l2

from dataset import DISEASE_DB, ALL_SYMPTOMS, DISEASE_NAMES

warnings.filterwarnings("ignore")
np.random.seed(42)
tf.random.set_seed(42)

RESULTS_DIR = "results"
MODEL_DIR   = "model"
os.makedirs(RESULTS_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)

print("=" * 70)
print("  SwasthyaVani — Model Training Pipeline")
print(f"  Diseases: {len(DISEASE_NAMES)}  |  Symptoms: {len(ALL_SYMPTOMS)}")
print("=" * 70)

# ─── Step 1: Build Synthetic Dataset ─────────────────────────────────────────
print("\n[1/7] Building dataset...")

def build_dataset(samples_per_disease=120, noise_prob=0.08, augment=True):
    """
    For each disease, generate `samples_per_disease` training examples.
    Each sample is a binary vector of 158 symptoms.
    Noise is added to simulate real-world variability.
    Augmentation creates partial symptom presentations.
    """
    rows, labels = [], []
    rng = np.random.default_rng(42)

    for disease, meta in DISEASE_DB.items():
        core_symptoms = meta["symptoms"]

        for i in range(samples_per_disease):
            row = {s: 0 for s in ALL_SYMPTOMS}

            # ── Full presentation (60%) ──────────────────────────────────────
            if i < int(samples_per_disease * 0.6):
                for s in core_symptoms:
                    if s in row:
                        row[s] = 1
                # add 1-2 random noise symptoms
                noise_syms = rng.choice(ALL_SYMPTOMS, size=rng.integers(0,3), replace=False)
                for s in noise_syms:
                    if rng.random() < noise_prob:
                        row[s] = 1

            # ── Partial presentation (30%) ───────────────────────────────────
            elif i < int(samples_per_disease * 0.9):
                n = max(2, int(len(core_symptoms) * rng.uniform(0.5, 0.8)))
                chosen = rng.choice(core_symptoms, size=min(n, len(core_symptoms)), replace=False)
                for s in chosen:
                    if s in row:
                        row[s] = 1

            # ── Minimal presentation (10%) ───────────────────────────────────
            else:
                n = max(1, int(len(core_symptoms) * rng.uniform(0.3, 0.5)))
                chosen = rng.choice(core_symptoms, size=min(n, len(core_symptoms)), replace=False)
                for s in chosen:
                    if s in row:
                        row[s] = 1

            rows.append(row)
            labels.append(disease)

    df = pd.DataFrame(rows)
    df["disease"] = labels
    return df

df = build_dataset(samples_per_disease=120)
print(f"   Dataset shape   : {df.shape}")
print(f"   Total samples   : {len(df)}")
print(f"   Classes (diseases): {df['disease'].nunique()}")
print(f"   Samples per class : {df.groupby('disease').size().mean():.0f} avg")

# ─── Step 2: Encode Labels ───────────────────────────────────────────────────
print("\n[2/7] Encoding labels...")

X = df[ALL_SYMPTOMS].values.astype(np.float32)
le = LabelEncoder()
y = le.fit_transform(df["disease"])
n_classes = len(le.classes_)

print(f"   Feature matrix : {X.shape}")
print(f"   Label vector   : {y.shape}")
print(f"   Classes        : {n_classes}")

# ─── Step 3: Train/Test Split ────────────────────────────────────────────────
print("\n[3/7] Splitting dataset (80/20 stratified)...")

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)

# Scale for DNN
scaler = StandardScaler()
X_train_sc = scaler.fit_transform(X_train)
X_test_sc  = scaler.transform(X_test)

print(f"   Train : {X_train.shape[0]} samples")
print(f"   Test  : {X_test.shape[0]} samples")

# ─── Helper: compute all metrics ─────────────────────────────────────────────
def evaluate_model(name, y_true, y_pred, y_proba=None):
    acc  = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred, average="weighted", zero_division=0)
    rec  = recall_score(y_true, y_pred, average="weighted", zero_division=0)
    f1   = f1_score(y_true, y_pred, average="weighted", zero_division=0)
    f1m  = f1_score(y_true, y_pred, average="macro", zero_division=0)

    auc = None
    if y_proba is not None:
        try:
            auc = roc_auc_score(
                to_categorical(y_true, num_classes=n_classes),
                y_proba, multi_class="ovr", average="macro"
            )
        except Exception:
            auc = None

    metrics = {
        "Model":             name,
        "Accuracy (%)":      round(acc  * 100, 2),
        "Precision (%)":     round(prec * 100, 2),
        "Recall (%)":        round(rec  * 100, 2),
        "F1-Score Weighted": round(f1   * 100, 2),
        "F1-Score Macro":    round(f1m  * 100, 2),
        "ROC-AUC (Macro)":   round(auc  * 100, 2) if auc else "N/A",
    }
    return metrics, acc

results_table = []

# ─── MODEL 1: Random Forest ───────────────────────────────────────────────────
print("\n" + "─"*70)
print("[4/7] Training Model 1: Random Forest Classifier")
print("─"*70)

t0 = time.time()
rf_model = RandomForestClassifier(
    n_estimators=300,
    max_depth=None,
    min_samples_split=2,
    min_samples_leaf=1,
    max_features="sqrt",
    class_weight="balanced",
    random_state=42,
    n_jobs=-1,
)
rf_model.fit(X_train, y_train)
rf_time = time.time() - t0

rf_pred  = rf_model.predict(X_test)
rf_proba = rf_model.predict_proba(X_test)
rf_metrics, rf_acc = evaluate_model("Random Forest", y_test, rf_pred, rf_proba)
rf_metrics["Training Time (s)"] = round(rf_time, 2)
results_table.append(rf_metrics)

print(f"   Accuracy     : {rf_metrics['Accuracy (%)']:.2f}%")
print(f"   Precision    : {rf_metrics['Precision (%)']:.2f}%")
print(f"   Recall       : {rf_metrics['Recall (%)']:.2f}%")
print(f"   F1 (Weighted): {rf_metrics['F1-Score Weighted']:.2f}%")
print(f"   ROC-AUC      : {rf_metrics['ROC-AUC (Macro)']}")
print(f"   Training time: {rf_time:.2f}s")

# 5-fold cross validation
print("   Running 5-fold cross-validation...")
cv_scores = cross_val_score(rf_model, X, y, cv=5, scoring="accuracy", n_jobs=-1)
print(f"   CV Accuracy  : {cv_scores.mean()*100:.2f}% ± {cv_scores.std()*100:.2f}%")
rf_metrics["CV Accuracy (5-fold)"] = f"{cv_scores.mean()*100:.2f}% ± {cv_scores.std()*100:.2f}%"

# Save confusion matrix
cm_rf = confusion_matrix(y_test, rf_pred)
joblib.dump(rf_model, f"{MODEL_DIR}/rf_model.pkl")

# ─── MODEL 2: XGBoost ─────────────────────────────────────────────────────────
print("\n" + "─"*70)
print("[5/7] Training Model 2: XGBoost Classifier")
print("─"*70)

t0 = time.time()
xgb_model = xgb.XGBClassifier(
    n_estimators=300,
    max_depth=6,
    learning_rate=0.1,
    subsample=0.8,
    colsample_bytree=0.8,
    gamma=0.1,
    reg_alpha=0.1,
    reg_lambda=1.0,
    use_label_encoder=False,
    eval_metric="mlogloss",
    random_state=42,
    n_jobs=-1,
    tree_method="hist",
)
xgb_model.fit(
    X_train, y_train,
    eval_set=[(X_test, y_test)],
    verbose=False
)
xgb_time = time.time() - t0

xgb_pred  = xgb_model.predict(X_test)
xgb_proba = xgb_model.predict_proba(X_test)
xgb_metrics, xgb_acc = evaluate_model("XGBoost", y_test, xgb_pred, xgb_proba)
xgb_metrics["Training Time (s)"] = round(xgb_time, 2)
results_table.append(xgb_metrics)

print(f"   Accuracy     : {xgb_metrics['Accuracy (%)']:.2f}%")
print(f"   Precision    : {xgb_metrics['Precision (%)']:.2f}%")
print(f"   Recall       : {xgb_metrics['Recall (%)']:.2f}%")
print(f"   F1 (Weighted): {xgb_metrics['F1-Score Weighted']:.2f}%")
print(f"   ROC-AUC      : {xgb_metrics['ROC-AUC (Macro)']}")
print(f"   Training time: {xgb_time:.2f}s")

print("   Running 5-fold cross-validation...")
cv_scores_xgb = cross_val_score(xgb_model, X, y, cv=5, scoring="accuracy", n_jobs=-1)
print(f"   CV Accuracy  : {cv_scores_xgb.mean()*100:.2f}% ± {cv_scores_xgb.std()*100:.2f}%")
xgb_metrics["CV Accuracy (5-fold)"] = f"{cv_scores_xgb.mean()*100:.2f}% ± {cv_scores_xgb.std()*100:.2f}%"

cm_xgb = confusion_matrix(y_test, xgb_pred)
joblib.dump(xgb_model, f"{MODEL_DIR}/xgb_model.pkl")

# ─── MODEL 3: Deep Neural Network ─────────────────────────────────────────────
print("\n" + "─"*70)
print("[6/7] Training Model 3: Deep Neural Network (DNN)")
print("─"*70)

y_train_cat = to_categorical(y_train, num_classes=n_classes)
y_test_cat  = to_categorical(y_test,  num_classes=n_classes)

# Compute class weights for imbalanced data
class_weights_arr = compute_class_weight("balanced", classes=np.unique(y_train), y=y_train)
class_weight_dict = {i: w for i, w in enumerate(class_weights_arr)}

def build_dnn(input_dim, num_classes):
    """
    Architecture:
      Input(158) → Dense(512, ReLU) → BN → Dropout(0.4)
                → Dense(256, ReLU) → BN → Dropout(0.35)
                → Dense(256, ReLU) → BN → Dropout(0.3)
                → Dense(128, ReLU) → BN → Dropout(0.25)
                → Dense(64,  ReLU) → BN → Dropout(0.2)
                → Dense(num_classes, Softmax)
    """
    model = Sequential([
        Dense(512, activation="relu", input_dim=input_dim,
              kernel_regularizer=l2(1e-4)),
        BatchNormalization(),
        Dropout(0.4),

        Dense(256, activation="relu", kernel_regularizer=l2(1e-4)),
        BatchNormalization(),
        Dropout(0.35),

        Dense(256, activation="relu", kernel_regularizer=l2(1e-4)),
        BatchNormalization(),
        Dropout(0.3),

        Dense(128, activation="relu", kernel_regularizer=l2(1e-4)),
        BatchNormalization(),
        Dropout(0.25),

        Dense(64, activation="relu", kernel_regularizer=l2(1e-4)),
        BatchNormalization(),
        Dropout(0.2),

        Dense(num_classes, activation="softmax"),
    ])
    model.compile(
        optimizer=Adam(learning_rate=5e-4),
        loss="categorical_crossentropy",
        metrics=["accuracy"]
    )
    return model

dnn_model = build_dnn(len(ALL_SYMPTOMS), n_classes)
dnn_model.summary()

callbacks = [
    EarlyStopping(monitor="val_accuracy", patience=15, restore_best_weights=True, verbose=1),
    ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=7, min_lr=1e-6, verbose=1),
]

t0 = time.time()
history = dnn_model.fit(
    X_train_sc, y_train_cat,
    validation_data=(X_test_sc, y_test_cat),
    epochs=150,
    batch_size=64,
    class_weight=class_weight_dict,
    callbacks=callbacks,
    verbose=1,
)
dnn_time = time.time() - t0

dnn_proba = dnn_model.predict(X_test_sc, verbose=0)
dnn_pred  = np.argmax(dnn_proba, axis=1)
dnn_metrics, dnn_acc = evaluate_model("Deep Neural Network", y_test, dnn_pred, dnn_proba)
dnn_metrics["Training Time (s)"] = round(dnn_time, 2)
dnn_metrics["CV Accuracy (5-fold)"] = "N/A (DNN)"
results_table.append(dnn_metrics)

print(f"\n   Accuracy     : {dnn_metrics['Accuracy (%)']:.2f}%")
print(f"   Precision    : {dnn_metrics['Precision (%)']:.2f}%")
print(f"   Recall       : {dnn_metrics['Recall (%)']:.2f}%")
print(f"   F1 (Weighted): {dnn_metrics['F1-Score Weighted']:.2f}%")
print(f"   ROC-AUC      : {dnn_metrics['ROC-AUC (Macro)']}")
print(f"   Training time: {dnn_time:.2f}s")

cm_dnn = confusion_matrix(y_test, dnn_pred)
dnn_model.save(f"{MODEL_DIR}/dnn_model.keras")

# Save DNN training history plot
fig, axes = plt.subplots(1, 2, figsize=(14, 5))
axes[0].plot(history.history["accuracy"],   label="Train Accuracy",  color="#064e3b", linewidth=2)
axes[0].plot(history.history["val_accuracy"],label="Val Accuracy",   color="#10b981", linewidth=2, linestyle="--")
axes[0].set_title("DNN Accuracy over Epochs", fontsize=14, fontweight="bold")
axes[0].set_xlabel("Epoch"); axes[0].set_ylabel("Accuracy")
axes[0].legend(); axes[0].grid(alpha=0.3)
axes[1].plot(history.history["loss"],    label="Train Loss", color="#064e3b", linewidth=2)
axes[1].plot(history.history["val_loss"],label="Val Loss",   color="#ef4444", linewidth=2, linestyle="--")
axes[1].set_title("DNN Loss over Epochs", fontsize=14, fontweight="bold")
axes[1].set_xlabel("Epoch"); axes[1].set_ylabel("Loss")
axes[1].legend(); axes[1].grid(alpha=0.3)
plt.tight_layout()
plt.savefig(f"{RESULTS_DIR}/dnn_training_history.png", dpi=150, bbox_inches="tight")
plt.close()
print(f"   Training history saved → {RESULTS_DIR}/dnn_training_history.png")

# ─── Step 7: Compare All Models ───────────────────────────────────────────────
print("\n" + "=" * 70)
print("[7/7] MODEL COMPARISON & BEST MODEL SELECTION")
print("=" * 70)

results_df = pd.DataFrame(results_table)
results_df = results_df.set_index("Model")

# Print comparison table
print("\n📊 RESULTS TABLE:")
print(results_df[[
    "Accuracy (%)", "Precision (%)", "Recall (%)",
    "F1-Score Weighted", "F1-Score Macro", "ROC-AUC (Macro)", "Training Time (s)"
]].to_string())

# Determine best model by accuracy
accs = {"Random Forest": rf_acc, "XGBoost": xgb_acc, "Deep Neural Network": dnn_acc}
best_name = max(accs, key=accs.get)
best_acc  = accs[best_name]

print(f"\n🏆 BEST MODEL: {best_name} with Accuracy = {best_acc*100:.2f}%")

# Save best model artifacts
if best_name == "Random Forest":
    best_model = rf_model
    joblib.dump(best_model, f"{MODEL_DIR}/best_model.pkl")
    joblib.dump(scaler,     f"{MODEL_DIR}/scaler.pkl")
    best_type = "sklearn"
elif best_name == "XGBoost":
    best_model = xgb_model
    joblib.dump(best_model, f"{MODEL_DIR}/best_model.pkl")
    joblib.dump(scaler,     f"{MODEL_DIR}/scaler.pkl")
    best_type = "sklearn"
else:
    dnn_model.save(f"{MODEL_DIR}/best_model.keras")
    joblib.dump(scaler, f"{MODEL_DIR}/scaler.pkl")
    best_type = "dnn"

joblib.dump(le,          f"{MODEL_DIR}/label_encoder.pkl")
joblib.dump(ALL_SYMPTOMS,f"{MODEL_DIR}/symptoms_list.pkl")

# Save best model info for Flask API
meta = {
    "best_model":    best_name,
    "best_accuracy": round(best_acc * 100, 2),
    "best_type":     best_type,
    "num_diseases":  len(DISEASE_NAMES),
    "num_symptoms":  len(ALL_SYMPTOMS),
    "all_results":   results_table,
}
with open(f"{MODEL_DIR}/model_meta.json", "w") as f:
    json.dump(meta, f, indent=2)

# Save detailed disease info
disease_meta = {}
for name, data in DISEASE_DB.items():
    disease_meta[name] = {
        "severity": data["severity"],
        "advice":   data["advice"],
        "telugu":   data["telugu"],
        "hindi":    data["hindi"],
        "category": data["category"],
        "icd10":    data.get("icd10",""),
    }
with open(f"{MODEL_DIR}/disease_meta.json", "w", encoding="utf-8") as f:
    json.dump(disease_meta, f, ensure_ascii=False, indent=2)

print(f"\n✅ Model artifacts saved to → {MODEL_DIR}/")

# ─── Visualizations ───────────────────────────────────────────────────────────

# 1. Model accuracy comparison bar chart
fig, ax = plt.subplots(figsize=(10, 6))
models = list(accs.keys())
accuracies = [v*100 for v in accs.values()]
colors = ["#064e3b", "#10b981", "#047857"]
bars = ax.bar(models, accuracies, color=colors, width=0.5, edgecolor="white", linewidth=1.5)
for bar, acc in zip(bars, accuracies):
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.3,
            f"{acc:.2f}%", ha="center", va="bottom", fontweight="bold", fontsize=12)
ax.set_title("Model Accuracy Comparison\nAI-Assisted Rural Healthcare Diagnosis",
             fontsize=14, fontweight="bold", pad=15)
ax.set_ylabel("Accuracy (%)", fontsize=12)
ax.set_ylim(0, 110)
ax.grid(axis="y", alpha=0.3)
best_bar_idx = models.index(best_name)
bars[best_bar_idx].set_edgecolor("gold")
bars[best_bar_idx].set_linewidth(3)
ax.text(0.5, 0.95, f"🏆 Best: {best_name} ({best_acc*100:.2f}%)",
        transform=ax.transAxes, ha="center", fontsize=11,
        bbox=dict(boxstyle="round", facecolor="gold", alpha=0.3))
plt.tight_layout()
plt.savefig(f"{RESULTS_DIR}/model_comparison.png", dpi=150, bbox_inches="tight")
plt.close()

# 2. Confusion matrix for best model
if best_name == "Random Forest":    cm = cm_rf
elif best_name == "XGBoost":        cm = cm_xgb
else:                               cm = cm_dnn

# Plot top-40 confusion matrix (for readability)
n_show = min(40, n_classes)
fig, ax = plt.subplots(figsize=(20, 16))
sns.heatmap(cm[:n_show, :n_show], annot=False, fmt="d", cmap="YlOrRd",
            xticklabels=le.classes_[:n_show],
            yticklabels=le.classes_[:n_show],
            ax=ax, linewidths=0.5)
ax.set_title(f"Confusion Matrix — {best_name} (Top {n_show} Diseases)",
             fontsize=14, fontweight="bold", pad=15)
ax.set_xlabel("Predicted", fontsize=11)
ax.set_ylabel("Actual", fontsize=11)
plt.xticks(rotation=45, ha="right", fontsize=7)
plt.yticks(rotation=0, fontsize=7)
plt.tight_layout()
plt.savefig(f"{RESULTS_DIR}/confusion_matrix_{best_name.replace(' ','_')}.png",
            dpi=150, bbox_inches="tight")
plt.close()

# 3. Full metrics comparison grouped bar chart
metrics_to_plot = ["Accuracy (%)", "Precision (%)", "Recall (%)", "F1-Score Weighted"]
fig, ax = plt.subplots(figsize=(14, 7))
x = np.arange(len(metrics_to_plot))
width = 0.22
offsets = [-width, 0, width]
model_names_plot = ["Random Forest", "XGBoost", "Deep Neural Network"]
colors_plot = ["#064e3b", "#10b981", "#3b82f6"]

for i, (mname, color) in enumerate(zip(model_names_plot, colors_plot)):
    vals = [results_df.loc[mname, m] for m in metrics_to_plot]
    bars = ax.bar(x + offsets[i], vals, width, label=mname, color=color, alpha=0.9)
    for bar, v in zip(bars, vals):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.3,
                f"{v:.1f}", ha="center", va="bottom", fontsize=8, fontweight="bold")

ax.set_title("Detailed Metrics Comparison Across All Models",
             fontsize=14, fontweight="bold", pad=15)
ax.set_xticks(x)
ax.set_xticklabels(metrics_to_plot, fontsize=11)
ax.set_ylabel("Score (%)", fontsize=12)
ax.set_ylim(0, 115)
ax.legend(fontsize=11)
ax.grid(axis="y", alpha=0.3)
plt.tight_layout()
plt.savefig(f"{RESULTS_DIR}/detailed_metrics_comparison.png", dpi=150, bbox_inches="tight")
plt.close()

# 4. Feature importance (RF or XGB)
if best_name in ["Random Forest", "XGBoost"]:
    importances = best_model.feature_importances_
    indices = np.argsort(importances)[::-1][:30]
    fig, ax = plt.subplots(figsize=(14, 8))
    ax.barh([ALL_SYMPTOMS[i].replace("_"," ") for i in indices[::-1]],
            importances[indices[::-1]], color="#064e3b", alpha=0.85)
    ax.set_title(f"Top 30 Feature Importances — {best_name}",
                 fontsize=14, fontweight="bold", pad=15)
    ax.set_xlabel("Importance Score", fontsize=12)
    ax.grid(axis="x", alpha=0.3)
    plt.tight_layout()
    plt.savefig(f"{RESULTS_DIR}/feature_importance.png", dpi=150, bbox_inches="tight")
    plt.close()

# 5. Classification report per model
for mname, pred in [("Random_Forest",rf_pred),("XGBoost",xgb_pred),("DNN",dnn_pred)]:
    report = classification_report(y_test, pred, target_names=le.classes_, zero_division=0)
    with open(f"{RESULTS_DIR}/classification_report_{mname}.txt", "w") as f:
        f.write(f"Classification Report — {mname}\n")
        f.write("="*70 + "\n")
        f.write(report)

# Save full comparison CSV
results_df.to_csv(f"{RESULTS_DIR}/model_comparison.csv")

# ─── Final Summary ────────────────────────────────────────────────────────────
print("\n" + "=" * 70)
print("  TRAINING COMPLETE — SUMMARY")
print("=" * 70)
print(f"\n  🏆 Best Model        : {best_name}")
print(f"  📊 Best Accuracy     : {best_acc*100:.2f}%")
print(f"  🎯 F1-Score Weighted : {results_df.loc[best_name,'F1-Score Weighted']:.2f}%")
print(f"  🔬 Diseases covered  : {len(DISEASE_NAMES)}")
print(f"  💡 Symptoms used     : {len(ALL_SYMPTOMS)}")
print(f"\n  Saved artifacts:")
print(f"  ├── model/best_model.{'keras' if best_type=='dnn' else 'pkl'}")
print(f"  ├── model/label_encoder.pkl")
print(f"  ├── model/symptoms_list.pkl")
print(f"  ├── model/scaler.pkl")
print(f"  ├── model/model_meta.json")
print(f"  ├── model/disease_meta.json")
print(f"  ├── results/model_comparison.png")
print(f"  ├── results/model_comparison.csv")
print(f"  ├── results/confusion_matrix_{best_name.replace(' ','_')}.png")
print(f"  ├── results/detailed_metrics_comparison.png")
print(f"  ├── results/feature_importance.png  (if tree model)")
print(f"  └── results/classification_report_*.txt (all 3 models)")
print("=" * 70)
print("\n  ▶  Next step: python app.py  (starts Flask API on :5001)")
print("=" * 70)
