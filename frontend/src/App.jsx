/**
 * App.jsx — Root Component
 * ========================
 * Main application shell. Manages global state and coordinates
 * data fetching between the map and sidebar panels.
 * 
 * Layout:
 * ┌─────────────────────────────────────────────────┐
 * │  Header (title + stats bar)                     │
 * ├─────────────────────┬───────────────────────────┤
 * │  Left Sidebar       │  Map (main canvas)        │
 * │  - Search           │                           │
 * │  - Risk Legend      │                           │
 * │  - Active Stats     │                           │
 * ├─────────────────────┴───────────────────────────┤
 * │  Bottom Panels (SHAP chart + Timeline)          │
 * └─────────────────────────────────────────────────┘
 */

import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header.jsx'
import MapView from './components/MapView.jsx'
import Sidebar from './components/Sidebar.jsx'
import SHAPChart from './components/SHAPChart.jsx'
import TimelineChart from './components/TimelineChart.jsx'
import StatsBar from './components/StatsBar.jsx'
import LoadingOverlay from './components/LoadingOverlay.jsx'
import { fetchRiskGrid, fetchSHAPValues, fetchTimeline, fetchStats } from './utils/api.js'


// Initial sample location; additional global demo locations are in the picker.
const DEFAULT_LOCATION = { lat: 37.5, lng: -119.5, name: 'Sierra Nevada, California' }


export default function App() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [location, setLocation]       = useState(DEFAULT_LOCATION)
  const [gridData, setGridData]       = useState(null)      // Risk grid cells
  const [shapData, setSHAPData]       = useState(null)      // SHAP values
  const [timeline, setTimeline]       = useState(null)      // 72hr timeline
  const [stats, setStats]             = useState(null)      // Dashboard stats
  const [selectedCell, setSelectedCell] = useState(null)   // Clicked map cell
  const [loading, setLoading]         = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [error, setError]             = useState(null)


  // ── Fetch SHAP + Stats once on mount ──────────────────────────────────────
  useEffect(() => {
    Promise.all([fetchSHAPValues(), fetchStats()])
      .then(([shapRes, statsRes]) => {
        setSHAPData(shapRes.features)
        setStats(statsRes)
      })
      .catch(() => setError('Backend not running. Start the Python server first.'))
      .finally(() => setInitialLoad(false))
  }, [])


  // ── Fetch risk grid when location changes ─────────────────────────────────
  const analyzeLocation = useCallback(async (loc) => {
    setLoading(true)
    setError(null)
    setSelectedCell(null)

    try {
      const [gridRes, timelineRes] = await Promise.all([
        fetchRiskGrid(loc.lat, loc.lng, 50),
        fetchTimeline(loc.lat, loc.lng)
      ])
      setGridData(gridRes)
      setTimeline(timelineRes.timeline)
      setLocation(loc)
    } catch (err) {
      setError('Could not fetch predictions. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }, [])


  // ── Load default location on startup ─────────────────────────────────────
  useEffect(() => {
    if (!initialLoad) {
      analyzeLocation(DEFAULT_LOCATION)
    }
  }, [initialLoad, analyzeLocation])


  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-[#0c0a09] text-stone-100 overflow-hidden">

      {/* ── Top Header Bar ────────────────────────────────────────────────── */}
      <Header onSearch={analyzeLocation} currentLocation={location} />

      {/* ── Stats Bar ─────────────────────────────────────────────────────── */}
      <StatsBar stats={stats} />

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left Sidebar ─────────────────────────────────────────────── */}
        <Sidebar
          selectedCell={selectedCell}
          location={location}
          gridData={gridData}
          onLocationSelect={analyzeLocation}
        />

        {/* ── Map + Bottom Panels ────────────────────────────────────── */}
        <div className="flex flex-col flex-1 overflow-hidden">

          {/* Map takes most vertical space */}
          <div className="flex-1 relative z-0 min-h-0">
            {loading && <LoadingOverlay />}

            <MapView
              center={location}
              gridData={gridData}
              onCellClick={setSelectedCell}
              selectedCell={selectedCell}
            />

            {error && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]
                              bg-red-950 border border-red-800 text-red-300 
                              px-4 py-3 rounded-xl text-sm font-mono max-w-sm text-center">
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* ── Bottom Analytics Row ─────────────────────────────────── */}
          <div className="flex h-56 border-t border-orange-950/50 bg-[#1c1917]">

            {/* SHAP Feature Importance */}
            <div className="flex-1 border-r border-orange-950/50 overflow-hidden">
              <SHAPChart data={shapData} />
            </div>

            {/* 72-Hour Risk Timeline */}
            <div className="flex-[2] overflow-hidden">
              <TimelineChart data={timeline} />
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
