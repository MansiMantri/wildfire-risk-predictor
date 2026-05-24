/**
 * MapView.jsx — Interactive Leaflet Risk Map
 * ============================================
 * The main visualization. Renders:
 * 1. Dark-themed satellite/terrain base map
 * 2. Colored risk grid (per-cell rectangles)
 * 3. Click popup with detailed cell info
 * 4. Pulsing marker at the analyzed center
 * 5. Legend overlay
 * 
 * Uses react-leaflet for map rendering.
 * Grid cells are L.rectangle() layers with risk-based fill colors.
 */

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Rectangle, CircleMarker, 
         Popup, useMap, LayersControl } from 'react-leaflet'
import { Layers, ZoomIn, ZoomOut } from 'lucide-react'
import { riskToClass } from '../utils/api.js'

// Cell size in degrees (approximately 5km at mid-latitudes)
const CELL_SIZE = 0.045

const formatCoordinate = (value, positive, negative) =>
  `${Math.abs(value).toFixed(4)}°${value >= 0 ? positive : negative}`

// ── Component to re-center map when location changes ──────────────────────────
function MapRecenter({ center }) {
  const map = useMap()
  useEffect(() => {
    map.setView([center.lat, center.lng], 9, { animate: true, duration: 1.2 })
  }, [center, map])
  return null
}


// ── Popup content for clicked cell ────────────────────────────────────────────
function CellPopup({ cell }) {
  const { features: f, risk, label } = cell
  const labelClass = riskToClass(label)

  return (
    <div className="p-3 min-w-[220px]">
      {/* Risk header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-stone-400 font-mono">FIRE SPREAD RISK</span>
        <span className={`px-2 py-0.5 rounded text-xs font-mono font-semibold ${labelClass}`}>
          {label}
        </span>
      </div>

      {/* Big risk number */}
      <div className="text-3xl font-display text-center py-2"
           style={{ color: cell.color }}>
        {(risk * 100).toFixed(1)}%
      </div>

      {/* Feature breakdown */}
      <div className="space-y-1.5 mt-3 border-t border-stone-700 pt-3">
        {[
          ['Wind Speed',    `${f.wind_speed} km/h`,        f.wind_speed / 80],
          ['Wind Align',    `${(f.wind_alignment * 100).toFixed(0)}%`, f.wind_alignment],
          ['Humidity',      `${f.humidity}%`,               1 - f.humidity / 100],
          ['Temperature',   `${f.temperature}°C`,           f.temperature / 50],
          ['NDVI (dry)',    `${(1-f.ndvi_index).toFixed(2)}`, 1 - f.ndvi_index],
          ['Fuel Moisture', `${f.fuel_moisture?.toFixed(1)}`, f.fuel_moisture / 100],
        ].map(([name, value, barVal]) => (
          <div key={name} className="flex items-center gap-2">
            <span className="text-[10px] text-stone-500 w-20 flex-shrink-0">{name}</span>
            <div className="flex-1 h-1.5 bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, barVal * 100)}%`,
                  background: `linear-gradient(90deg, #f97316, #ef4444)`
                }}
              />
            </div>
            <span className="text-[10px] font-mono text-stone-300 w-14 text-right">
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Coordinates */}
      <div className="flex gap-3 mt-3 pt-2 border-t border-stone-700">
        <span className="text-[9px] font-mono text-stone-600">
          {formatCoordinate(cell.lat, 'N', 'S')}, {formatCoordinate(cell.lng, 'E', 'W')}
        </span>
      </div>
    </div>
  )
}


// ── Main Map Component ─────────────────────────────────────────────────────────
export default function MapView({ center, gridData, onCellClick, selectedCell }) {

  const getRectBounds = (lat, lng) => [
    [lat - CELL_SIZE / 2, lng - CELL_SIZE / 2],
    [lat + CELL_SIZE / 2, lng + CELL_SIZE / 2],
  ]

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={9}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        {/* ── Dark Base Map ──────────────────────────────────────────── */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution="CartoDB"
        />

        {/* ── Re-center on location change ────────────────────────── */}
        <MapRecenter center={center} />

        {/* ── Risk Grid Cells ─────────────────────────────────────── */}
        {gridData?.grid_cells?.map((cell, idx) => (
          <Rectangle
            key={`${cell.lat}-${cell.lng}`}
            bounds={getRectBounds(cell.lat, cell.lng)}
            pathOptions={{
              fillColor:   cell.color,
              fillOpacity: 0.55,
              color:       cell === selectedCell ? '#fff' : cell.color,
              weight:      cell === selectedCell ? 2 : 0.3,
              opacity:     cell === selectedCell ? 0.9 : 0.4,
            }}
            eventHandlers={{
              click: () => onCellClick(cell)
            }}
          >
            <Popup>
              <CellPopup cell={cell} />
            </Popup>
          </Rectangle>
        ))}

        {/* ── Center Pulse Marker ──────────────────────────────────── */}
        <CircleMarker
          center={[center.lat, center.lng]}
          radius={8}
          pathOptions={{
            fillColor:   '#f97316',
            fillOpacity: 0.9,
            color:       '#fff',
            weight:      2,
          }}
        />
        <CircleMarker
          center={[center.lat, center.lng]}
          radius={20}
          pathOptions={{
            fillColor:   '#f97316',
            fillOpacity: 0.1,
            color:       '#f97316',
            weight:      1,
            opacity:     0.5,
          }}
        />

      </MapContainer>

      {/* ── Legend Overlay ─────────────────────────────────────────── */}
      <div className="absolute bottom-4 right-4 z-[900] 
                      bg-stone-950/90 backdrop-blur-sm border border-orange-950/50 
                      rounded-xl p-3 space-y-1.5 min-w-[130px]">
        <p className="text-[9px] font-mono text-stone-500 uppercase tracking-widest mb-2">
          72-Hr Risk
        </p>
        {[
          ['#22c55e', 'Low',      '< 25%'],
          ['#84cc16', 'Moderate', '25–40%'],
          ['#eab308', 'Elevated', '40–55%'],
          ['#f97316', 'High',     '55–70%'],
          ['#ef4444', 'Extreme',  '> 70%'],
        ].map(([color, label, range]) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm flex-shrink-0"
                 style={{ background: color, opacity: 0.85 }} />
            <span className="text-[10px] text-stone-300">{label}</span>
            <span className="text-[9px] text-stone-600 ml-auto font-mono">{range}</span>
          </div>
        ))}
      </div>

      {/* ── Map Attribution ─────────────────────────────────────────── */}
      <div className="absolute bottom-4 left-4 z-[900] 
                      text-[9px] text-stone-700 font-mono">
        Data: NASA FIRMS · MODIS · NOAA · SRTM
      </div>

      {/* ── No Data State ────────────────────────────────────────────── */}
      {!gridData && (
        <div className="absolute inset-0 z-[800] flex items-center justify-center 
                        pointer-events-none">
          <div className="bg-stone-950/80 backdrop-blur-sm border border-orange-900/40 
                          rounded-2xl px-8 py-6 text-center">
            <div className="text-4xl mb-3">🔥</div>
            <p className="text-stone-300 font-display text-2xl tracking-wider">
              SELECT A LOCATION
            </p>
            <p className="text-stone-600 text-sm mt-1">
              Choose from the dropdown to analyze wildfire risk
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
