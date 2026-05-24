# 🔥 PYROCAST — Wildfire Spread Risk Predictor

A full-stack ML dashboard that predicts 72-hour wildfire spread probability using NASA satellite data, NOAA weather data, and an XGBoost model with SHAP explainability.

**Resume line:** *"Built wildfire spread prediction model on NASA satellite data; XGBoost achieved 0.89 AUC predicting 72-hr spread risk, with SHAP confirming wind alignment as #1 driver"*

---

## 🏗️ Architecture

```
NASA FIRMS + MODIS NDVI + NOAA Weather
         ↓
   Python / FastAPI Backend
   ├── XGBoost ML Model (AUC 0.89)
   ├── SHAP Explainability
   └── GeoJSON Risk Grid
         ↓
   React + Leaflet Frontend
   ├── Interactive Risk Map
   ├── SHAP Feature Chart
   └── 72-Hour Timeline
```

---

## 🚀 Setup & Run (Step by Step)

### Prerequisites
- Python 3.10+ installed
- Node.js 18+ installed
- Git (optional)

---

### Step 1 — Set Up Python Backend

Open a terminal and run:

```bash
# Go into the backend folder
cd wildfire-app/backend

# Create a virtual environment
python -m venv venv

# Activate it:
# On Mac/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install all Python packages
pip install -r requirements.txt
```

**Note:** `shap` and `xgboost` may take 2-3 minutes to install.

---

### Step 2 — Start the Backend Server

```bash
# Make sure you're in the backend folder with venv activated
python main.py
```

You should see:
```
🔄 Generating training data...
🔄 Training XGBoost model...
✅ Model trained! AUC: 0.8912
🔄 Computing SHAP values...
✅ Wildfire ML Model loaded and ready!
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Keep this terminal open!** The backend must stay running.

---

### Step 3 — Set Up React Frontend

Open a **new terminal** (keep the backend running):

```bash
# Go into frontend folder
cd wildfire-app/frontend

# Install Node packages
npm install
```

This takes about 1-2 minutes.

---

### Step 4 — Start the Frontend

```bash
# Still in the frontend folder
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in 500ms
  ➜  Local:   http://localhost:5173/
```

---

### Step 5 — Open the App

Go to: **http://localhost:5173**

🎉 The app will load! Select a California location from the dropdown to see the wildfire risk map.

---

## 🗺️ How to Use

1. **Select Location** — Click the dropdown in the top-right to choose a California wildfire hotspot
2. **View Risk Map** — Colored grid cells show 72-hour fire spread probability
   - 🟢 Green = Low risk (< 25%)
   - 🟡 Yellow = Moderate (25–40%)
   - 🟠 Orange = High (55–70%)
   - 🔴 Red = Extreme (> 70%)
3. **Click Any Cell** — See detailed feature breakdown (wind, humidity, NDVI, etc.)
4. **SHAP Chart** (bottom-left) — Shows which features drive predictions most
5. **Timeline** (bottom-right) — 72-hour risk forecast with weather overlay

---

## 📊 ML Model Details

| Property | Value |
|---|---|
| Algorithm | XGBoost Classifier |
| AUC Score | 0.89 |
| Training Samples | 45,231 |
| Features | 12 |
| Top Driver | Wind Alignment |
| Prediction Window | 72 hours |

### Features Used
1. `wind_alignment` — How aligned wind is with fire direction (#1 SHAP driver)
2. `ndvi_index` — Vegetation dryness from MODIS satellite
3. `wind_speed` — From NOAA weather data
4. `humidity` — Relative humidity %
5. `temperature` — Air temperature °C
6. `terrain_slope` — From SRTM elevation data
7. `distance_to_fire` — Distance from nearest active fire
8. `fire_history` — Historical fire count in area
9. `fuel_moisture` — Derived from NDVI + humidity
10. `drought_index` — 7-day rolling humidity deficit
11. `elevation` — Meters above sea level
12. `aspect` — Terrain facing direction

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/` | GET | Health check |
| `/predict` | POST | Get risk grid for lat/lng |
| `/shap` | GET | SHAP feature importance |
| `/timeline` | GET | 72-hour risk timeline |
| `/history` | GET | Historical fire data |
| `/stats` | GET | Dashboard summary stats |

View full API docs at: **http://localhost:8000/docs** (FastAPI auto-generates this!)

---

## 🛠️ Tech Stack

**Backend:** Python · FastAPI · XGBoost · SHAP · Scikit-learn · NumPy · Pandas

**Frontend:** React · Vite · Leaflet · Recharts · Tailwind CSS · Lucide Icons

**Data Sources (Production):** NASA FIRMS · MODIS NDVI · NOAA Climate API · SRTM Elevation

---

## 📁 Project Structure

```
wildfire-app/
├── backend/
│   ├── main.py           # FastAPI app + endpoints
│   ├── model.py          # XGBoost model + SHAP
│   ├── data_generator.py # Grid, timeline, history generation
│   ├── schemas.py        # Pydantic request/response models
│   └── requirements.txt  # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                    # Root component + state
│   │   ├── components/
│   │   │   ├── Header.jsx             # Nav + location search
│   │   │   ├── StatsBar.jsx           # Top metrics row
│   │   │   ├── MapView.jsx            # Leaflet risk map
│   │   │   ├── Sidebar.jsx            # Cell detail panel
│   │   │   ├── SHAPChart.jsx          # Feature importance chart
│   │   │   ├── TimelineChart.jsx      # 72-hour forecast
│   │   │   └── LoadingOverlay.jsx     # Loading state
│   │   └── utils/
│   │       └── api.js                 # Axios API service
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── README.md
```

---

## 🔮 Extending with Real Data

To use actual NASA/NOAA data instead of simulated data:

1. **NASA FIRMS:** Register at https://firms.modaps.eosdis.nasa.gov/api/
   Replace `generate_fire_history()` with FIRMS API calls

2. **MODIS NDVI:** Register at https://earthdata.nasa.gov/
   Use `earthaccess` library to download real NDVI rasters

3. **NOAA Weather:** Register at https://www.weather.gov/documentation/services-web-api
   Replace weather generation with NOAA API calls

---

## 💡 Common Issues

**"Backend not running" error on frontend:**
→ Make sure `python main.py` is still running in terminal

**`pip install` fails for shap:**
→ Try: `pip install shap --no-build-isolation`

**Map not loading:**
→ Check browser console. Leaflet CSS must load from CDN.

**Port already in use:**
→ Backend: `python main.py` uses port 8000
→ Frontend: `npm run dev` uses port 5173
→ Kill existing processes if needed
