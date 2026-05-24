"""
Pydantic Schemas — Request/Response Models
==========================================
Defines all data shapes for the FastAPI endpoints.
Pydantic gives automatic validation + OpenAPI docs generation.
"""

from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class GridCell(BaseModel):
    """Single grid cell with coordinates and risk prediction."""
    lat: float
    lng: float
    risk: float           # 0.0 – 1.0 spread probability
    label: str            # "Low" | "Moderate" | "High" | "Extreme"
    color: str            # Hex color for map display
    features: Dict[str, Any]  # Raw feature values for tooltip


class RiskResponse(BaseModel):
    """Full prediction response for a queried location."""
    center_lat: float
    center_lng: float
    grid_cells: List[GridCell]
    model_auc: float
    timestamp: str


class SHAPFeature(BaseModel):
    """Single feature SHAP importance entry."""
    feature: str
    shap_value: float
    description: str
    percentage: float


class SHAPResponse(BaseModel):
    """SHAP feature importance response."""
    features: List[SHAPFeature]


class TimelinePoint(BaseModel):
    """Single hour in the 72-hour risk timeline."""
    hour: int
    risk: float
    label: str
    wind_speed: float
    humidity: float
    temp: float


class TimelineResponse(BaseModel):
    """72-hour timeline response."""
    timeline: List[TimelinePoint]
