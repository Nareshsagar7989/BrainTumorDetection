# BrainTumor AI – Brain Tumor Detection System

A full-stack medical AI web application that uses a CNN model to detect brain tumors from MRI scans.

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS + React Router v6 + Axios
- **Backend**: FastAPI + Motor (async MongoDB) + JWT + bcrypt + python-jose
- **AI Model**: TensorFlow/Keras CNN (EfficientNetB0 transfer learning)
- **Database**: MongoDB

---

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB (local or Atlas)

---

### 1. Clone & Setup

```bash
# Navigate to the project
cd mainproject
```

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment config
copy .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start the backend
uvicorn app.main:app --reload --port 8000
```

**Backend will run at:** `http://localhost:8000`
**API Docs (Swagger):** `http://localhost:8000/docs`

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend will run at:** `http://localhost:5173`

---

### 4. AI Model (Optional for Demo Mode)

The app runs in **Demo Mode** automatically if no trained model is found.
To train and use a real model:

```bash
# 1. Download dataset from Kaggle (see backend/ml_training/README.md)
# 2. Train the model
cd backend/ml_training
python train_model.py
# Model saved to backend/app/ml/brain_tumor_model.h5
# 3. Restart backend
```

---

## Project Structure

```
mainproject/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── database.py          # MongoDB connection
│   │   ├── models.py            # Document models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── auth.py              # JWT authentication
│   │   ├── routes/
│   │   │   ├── auth_routes.py   # POST /auth/register, /auth/login
│   │   │   ├── prediction_routes.py  # POST /predict
│   │   │   └── history_routes.py    # GET /history
│   │   ├── utils/
│   │   │   └── security.py      # bcrypt hashing
│   │   └── ml/
│   │       └── model_loader.py  # CNN model + preprocessing
│   ├── ml_training/
│   │   ├── train_model.py       # CNN training script
│   │   └── README.md            # Training guide
│   ├── uploads/                 # Saved MRI images
│   ├── .env                     # Environment variables
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx  # JWT auth state
    │   ├── services/
    │   │   └── api.js           # Axios instance + services
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   └── PredictionCard.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Upload.jsx       # Drag & drop MRI upload
    │   │   └── History.jsx
    │   ├── App.jsx              # React Router v6 routing
    │   └── main.jsx
    ├── tailwind.config.js
    └── package.json
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login, get JWT token |
| POST | `/predict` | Yes (JWT) | Upload MRI, get prediction |
| GET | `/history` | Yes (JWT) | Get user's prediction history |
| GET | `/docs` | No | Swagger API documentation |

---

## Features

- ✅ JWT authentication with bcrypt password hashing
- ✅ Drag & drop MRI image upload
- ✅ CNN tumor detection with confidence score
- ✅ Demo mode (works without trained model)
- ✅ Prediction history per user
- ✅ Protected routes (frontend + backend)
- ✅ Responsive dark-mode UI
- ✅ Toast notifications
- ✅ Loading states and skeletons

---

## Deployment

### Backend (Render/Railway)
```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
```

Update `VITE_API_URL` in frontend environment and `baseURL` in `src/services/api.js`.

---

## Medical Disclaimer

⚠️ This application is for **educational and screening purposes only**.
It is NOT a substitute for professional medical diagnosis.
Always consult a qualified healthcare professional for medical advice.
