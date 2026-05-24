/**
 * API Service — Axios wrapper for all backend calls
 * ===================================================
 * Centralizes all HTTP requests to the FastAPI backend.
 * Uses /api prefix which Vite proxies to http://localhost:8000
 */

import axios from 'axios'

// Base axios instance
const api = axios.create({
  baseURL: '/api',
  timeout: 30000,  // 30s — model inference can take a moment
  headers: { 'Content-Type': 'application/json' }
})

// ── Response interceptor — log errors nicely ─────────────────────────────────
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)


// ── API Functions ─────────────────────────────────────────────────────────────

/**
 * Fetch wildfire risk grid for a location.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radius - Analysis radius in km (default 50)
 */
export const fetchRiskGrid = (lat, lng, radius = 50) =>
  api.post('/predict', { latitude: lat, longitude: lng, radius_km: radius })


/**
 * Fetch SHAP feature importance values.
 * Returns sorted array of {feature, shap_value, percentage, description}
 */
export const fetchSHAPValues = () =>
  api.get('/shap')


/**
 * Fetch 72-hour risk timeline for a location.
 */
export const fetchTimeline = (lat, lng) =>
  api.get('/timeline', { params: { lat, lng } })


/**
 * Fetch historical fire data near a location.
 */
export const fetchFireHistory = (lat, lng, years = 5) =>
  api.get('/history', { params: { lat, lng, years } })


/**
 * Fetch dashboard summary stats.
 */
export const fetchStats = () =>
  api.get('/stats')


// ── Color helpers (match backend) ────────────────────────────────────────────
export const riskToColor = (risk) => {
  if (risk < 0.25) return '#22c55e'
  if (risk < 0.40) return '#84cc16'
  if (risk < 0.55) return '#eab308'
  if (risk < 0.70) return '#f97316'
  return '#ef4444'
}

export const riskToLabel = (risk) => {
  if (risk < 0.25) return 'Low'
  if (risk < 0.50) return 'Moderate'
  if (risk < 0.75) return 'High'
  return 'Extreme'
}

export const riskToClass = (label) => {
  const map = {
    Low: 'risk-low',
    Moderate: 'risk-moderate',
    High: 'risk-high',
    Extreme: 'risk-extreme'
  }
  return map[label] || 'risk-low'
}
