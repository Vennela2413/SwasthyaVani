# 🏥 SwasthyaVani — Voice-Enabled Multilingual Disease Detection for Rural India

## Tech Stack
- **Frontend**: React + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB
- **ML Service**: Python + Flask + scikit-learn
- **Auth**: JWT
- **Voice**: Web Speech API (Telugu/Hindi/English)

## Project Structure
```
ai-doctor/
├── client/          → React Frontend
├── server/          → Node.js + Express API
└── ml-service/      → Python Flask ML API
```

## Quick Start

### 1. ML Service (Python)
```bash
cd ml-service
pip install -r requirements.txt
python train_model.py       # Train the model once
python app.py               # Starts on http://localhost:5001
```

### 2. Backend (Node.js)
```bash
cd server
npm install
# Create .env file (see server/.env.example)
npm run dev                 # Starts on http://localhost:5000
```

### 3. Frontend (React)
```bash
cd client
npm install
npm start                   # Starts on http://localhost:3000
```


```

## API Endpoints

### Auth
- POST `/api/auth/register` — Register user
- POST `/api/auth/login` — Login + get JWT

### Health
- POST `/api/health/predict` — Predict disease from symptoms
- POST `/api/health/save` — Save health record
- GET  `/api/health/history` — Get user's history

### Doctors
- GET `/api/doctors/nearby?lat=&lng=` — Get nearby doctors

### ML Service
- POST `/predict` — Raw disease prediction
