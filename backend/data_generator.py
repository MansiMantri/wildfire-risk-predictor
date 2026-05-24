"""
Data Generator — Wildfire Risk Grid, History, Timeline
=======================================================
These functions simulate real NASA/NOAA data outputs for demo purposes.

In a production pipeline:
- generate_risk_grid() would use real MODIS NDVI rasters + NOAA weather API
- generate_fire_history() would pull from NASA FIRMS CSV
- generate_timeline() would use forecast model outputs

All functions take real lat/lng and return realistic geospatial data.
"""

import numpy as np
import math
from typing import List


# ─── Helper: lat/lng offset ────────────────────────────────────────────────────
def _offset_latlon(lat: float, lng: float, dx_km: float, dy_km: float):
    """
    Offset a lat/lng point by dx_km east and dy_km north.
    Uses simple flat-earth approximation (accurate within ~50km).
    """
    delta_lat = dy_km / 111.0            # 1 degree lat ≈ 111 km
    delta_lng = dx_km / (111.0 * math.cos(math.radians(lat)))
    return round(lat + delta_lat, 5), round(lng + delta_lng, 5)


def _risk_to_label(risk: float) -> str:
    """Convert 0-1 risk score to human-readable label."""
    if risk < 0.25:  return "Low"
    if risk < 0.50:  return "Moderate"
    if risk < 0.75:  return "High"
    return "Extreme"


def _risk_to_color(risk: float) -> str:
    """Convert risk score to hex color for map visualization."""
    if risk < 0.25:  return "#22c55e"   # green
    if risk < 0.40:  return "#84cc16"   # lime
    if risk < 0.55:  return "#eab308"   # yellow
    if risk < 0.70:  return "#f97316"   # orange
    return "#ef4444"                     # red


# ─── Risk Grid Generator ───────────────────────────────────────────────────────
def generate_risk_grid(
    center_lat: float,
    center_lng: float,
    radius_km: float,
    model,
    grid_spacing_km: float = 5.0
) -> List[dict]:
    """
    Generate a grid of risk predictions centered around (center_lat, center_lng).
    
    Each cell is grid_spacing_km x grid_spacing_km (~5km default).
    Features for each cell are generated using spatial patterns that
    mimic real NASA/NOAA data distributions.
    
    Returns list of GridCell dicts with lat, lng, risk, features.
    """
    np.random.seed(int(abs(center_lat * 1000 + center_lng * 100)) % 9999)

    cells = []
    steps = int(radius_km / grid_spacing_km)

    # Base weather for this region (would come from NOAA API in production)
    base_wind_speed    = np.random.uniform(10, 45)
    base_humidity      = np.random.uniform(15, 60)
    base_temperature   = np.random.uniform(22, 42)
    base_drought       = np.random.uniform(20, 85)

    all_features = []
    positions = []

    for i in range(-steps, steps + 1):
        for j in range(-steps, steps + 1):
            cell_lat, cell_lng = _offset_latlon(
                center_lat, center_lng,
                dx_km=j * grid_spacing_km,
                dy_km=i * grid_spacing_km
            )

            # Spatial variation — nearby cells are correlated (realistic)
            spatial_noise = np.random.normal(0, 0.05)

            # ── Feature values for this cell ──
            ndvi         = np.clip(np.random.beta(2, 3) + spatial_noise, 0, 1)
            wind_speed   = np.clip(base_wind_speed + np.random.normal(0, 5), 0, 80)
            wind_align   = np.clip(np.random.beta(1.5, 2) + spatial_noise * 0.5, 0, 1)
            humidity     = np.clip(base_humidity + np.random.normal(0, 8), 5, 95)
            temperature  = np.clip(base_temperature + np.random.normal(0, 3), 5, 50)
            slope        = np.clip(np.random.exponential(8), 0, 60)
            dist_fire    = np.clip(
                math.sqrt(i**2 + j**2) * grid_spacing_km + np.random.exponential(5),
                0.5, 150
            )
            fire_hist    = max(0, int(np.random.poisson(1.2)))
            fuel_moist   = (1 - ndvi) * (1 - humidity/100) * 100
            drought      = np.clip(base_drought + np.random.normal(0, 10), 0, 100)
            elevation    = np.clip(np.random.normal(500, 250), 0, 3000)
            aspect       = np.random.uniform(0, 360)

            features = [
                ndvi, wind_speed, wind_align, humidity, temperature,
                slope, dist_fire, fire_hist, fuel_moist, drought,
                elevation, aspect
            ]

            all_features.append(features)
            positions.append((cell_lat, cell_lng, {
                "ndvi_index":       round(ndvi, 3),
                "wind_speed":       round(wind_speed, 1),
                "wind_alignment":   round(wind_align, 3),
                "humidity":         round(humidity, 1),
                "temperature":      round(temperature, 1),
                "terrain_slope":    round(slope, 1),
                "distance_to_fire": round(dist_fire, 1),
                "fire_history":     fire_hist,
                "fuel_moisture":    round(fuel_moist, 1),
                "drought_index":    round(drought, 1),
            }))

    # Batch predict all cells at once (fast)
    import numpy as np_inner
    features_array = np_inner.array(all_features)
    risk_scores = model.predict_proba(features_array)

    for idx, (cell_lat, cell_lng, feat_dict) in enumerate(positions):
        risk = float(risk_scores[idx])
        cells.append({
            "lat":      cell_lat,
            "lng":      cell_lng,
            "risk":     round(risk, 4),
            "label":    _risk_to_label(risk),
            "color":    _risk_to_color(risk),
            "features": feat_dict
        })

    return cells


# ─── Historical Fire Data ──────────────────────────────────────────────────────
def generate_fire_history(lat: float, lng: float, years: int = 5) -> List[dict]:
    """
    Generate historical wildfire events near a location.
    Simulates NASA FIRMS historical fire perimeter data.
    """
    np.random.seed(int(abs(lat * 100 + lng * 50)) % 9999)

    fires = []
    current_year = 2024

    for year in range(current_year - years, current_year):
        # California wildfire season: June–November
        n_fires = np.random.poisson(2)
        for _ in range(n_fires):
            fire_lat, fire_lng = _offset_latlon(
                lat, lng,
                dx_km=np.random.uniform(-80, 80),
                dy_km=np.random.uniform(-80, 80)
            )
            fires.append({
                "year":       year,
                "month":      int(np.random.choice([6, 7, 8, 9, 10])),
                "lat":        fire_lat,
                "lng":        fire_lng,
                "acres":      int(np.random.lognormal(8, 1.5)),
                "containment": int(np.random.uniform(50, 100)),
                "name":       f"Fire {year}-{np.random.randint(100, 999)}"
            })

    return sorted(fires, key=lambda x: x["year"], reverse=True)


# ─── 72-Hour Timeline ──────────────────────────────────────────────────────────
def generate_timeline(lat: float, lng: float, model) -> List[dict]:
    """
    Generate hour-by-hour fire spread probability for 72 hours.
    
    In production: this would use weather forecast models (GFS/ECMWF)
    to get future wind/humidity forecasts, then run predictions per hour.
    """
    np.random.seed(int(abs(lat * 200 + lng * 150)) % 9999)

    base_risk = np.random.uniform(0.2, 0.7)
    timeline = []

    for hour in range(0, 73, 3):  # Every 3 hours
        # Simulate diurnal cycle: higher risk in afternoon (12-18h)
        hour_of_day = hour % 24
        diurnal = 0.15 * math.sin(math.pi * (hour_of_day - 6) / 12) if 6 <= hour_of_day <= 18 else -0.05

        # Simulate wind events (random spikes)
        wind_event = 0.2 if np.random.random() < 0.1 else 0

        risk = np.clip(
            base_risk + diurnal + wind_event + np.random.normal(0, 0.04),
            0.0, 1.0
        )

        timeline.append({
            "hour":       hour,
            "risk":       round(float(risk), 4),
            "label":      _risk_to_label(risk),
            "wind_speed": round(np.random.uniform(10, 50), 1),
            "humidity":   round(np.random.uniform(15, 60), 1),
            "temp":       round(np.random.uniform(20, 42), 1),
        })

    return timeline
