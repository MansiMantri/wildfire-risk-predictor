/**
 * Sidebar.jsx — Left Info Panel
 * ================================
 * Shows:
 * - Current analysis location info
 * - Selected cell detailed breakdown
 * - Risk distribution summary for the grid
 * - Quick-access preset locations
 */

import { MapPin, Flame, Wind, Droplets, Thermometer, 
         Mountain, History, Zap } from 'lucide-react'
import { riskToClass } from '../utils/api.js'

const formatCoordinate = (value, positive, negative) =>
  `${Math.abs(value).toFixed(4)}°${value >= 0 ? positive : negative}`


// ── Risk Gauge Bar ─────────────────────────────────────────────────────────────
function RiskGauge({ value, label }) {
  const pct = Math.round(value * 100)
  const color = value < 0.25 ? '#22c55e'
              : value < 0.50 ? '#eab308'
              : value < 0.75 ? '#f97316'
              : '#ef4444'

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-mono">
        <span className="text-stone-400">{label}</span>
        <span style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}


// ── Feature Row ───────────────────────────────────────────────────────────────
function FeatureRow({ icon: Icon, label, value, unit, color = '#f97316', barPct }) {
  return (
    <div className="flex items-center gap-2.5 py-2 border-b border-stone-800/50 last:border-0">
      <div className="w-6 flex-shrink-0 flex justify-center">
        <Icon size={13} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] text-stone-500 leading-none mb-0.5">{label}</div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1 h-1 bg-stone-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${barPct}%`, background: color, opacity: 0.7 }}
            />
          </div>
          <span className="text-xs font-mono text-stone-200 flex-shrink-0">
            {value}<span className="text-stone-500">{unit}</span>
          </span>
        </div>
      </div>
    </div>
  )
}


export default function Sidebar({ selectedCell, location, gridData }) {

  // Compute grid risk distribution
  const distribution = gridData ? (() => {
    const cells = gridData.grid_cells
    const total = cells.length
    const counts = { Low: 0, Moderate: 0, High: 0, Extreme: 0 }
    cells.forEach(c => counts[c.label]++)
    return Object.entries(counts).map(([label, count]) => ({
      label, count, pct: Math.round(count / total * 100)
    }))
  })() : null


  return (
    <aside className="w-64 flex-shrink-0 flex flex-col 
                       border-r border-orange-950/40 bg-[#1c1917] overflow-y-auto">

      {/* ── Location Header ──────────────────────────────────────────── */}
      <div className="p-4 border-b border-orange-950/30">
        <div className="flex items-center gap-2 mb-1">
          <MapPin size={13} className="text-orange-400" />
          <span className="text-xs font-mono text-stone-400 uppercase tracking-wider">
            Analysis Zone
          </span>
        </div>
        <h2 className="font-display text-lg tracking-wider text-stone-100 leading-tight">
          {location?.name || 'No Location'}
        </h2>
        <div className="text-[10px] font-mono text-stone-600 mt-0.5">
          {formatCoordinate(location.lat, 'N', 'S')}, {formatCoordinate(location.lng, 'E', 'W')}
        </div>
      </div>

      {/* ── Selected Cell Detail ──────────────────────────────────────── */}
      {selectedCell ? (
        <div className="p-4 border-b border-orange-950/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider">
              Selected Cell
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold 
                             ${riskToClass(selectedCell.label)}`}>
              {selectedCell.label}
            </span>
          </div>

          {/* Big risk score */}
          <div className="text-center py-3 mb-3 rounded-xl bg-stone-900/50 
                          border border-stone-800">
            <div className="font-display text-4xl"
                 style={{ color: selectedCell.color }}>
              {(selectedCell.risk * 100).toFixed(1)}%
            </div>
            <div className="text-[10px] text-stone-500 mt-0.5 font-mono">
              72-hour spread probability
            </div>
          </div>

          {/* Feature breakdown */}
          <div>
            <FeatureRow
              icon={Wind}
              label="Wind Speed"
              value={selectedCell.features.wind_speed?.toFixed(1)}
              unit=" km/h"
              color="#60a5fa"
              barPct={selectedCell.features.wind_speed / 80 * 100}
            />
            <FeatureRow
              icon={Zap}
              label="Wind Alignment"
              value={(selectedCell.features.wind_alignment * 100).toFixed(0)}
              unit="%"
              color="#f97316"
              barPct={selectedCell.features.wind_alignment * 100}
            />
            <FeatureRow
              icon={Droplets}
              label="Humidity"
              value={selectedCell.features.humidity?.toFixed(0)}
              unit="%"
              color="#34d399"
              barPct={selectedCell.features.humidity}
            />
            <FeatureRow
              icon={Thermometer}
              label="Temperature"
              value={selectedCell.features.temperature?.toFixed(1)}
              unit="°C"
              color="#f87171"
              barPct={selectedCell.features.temperature / 50 * 100}
            />
            <FeatureRow
              icon={Flame}
              label="Fuel Moisture"
              value={selectedCell.features.fuel_moisture?.toFixed(1)}
              unit="%"
              color="#fb923c"
              barPct={Math.min(100, selectedCell.features.fuel_moisture)}
            />
            <FeatureRow
              icon={History}
              label="Fire History"
              value={selectedCell.features.fire_history}
              unit=" fires"
              color="#a78bfa"
              barPct={selectedCell.features.fire_history * 10}
            />
          </div>
        </div>
      ) : (
        <div className="p-4 border-b border-orange-950/30">
          <div className="text-center py-6">
            <div className="text-3xl mb-2 opacity-40">🗺️</div>
            <p className="text-xs text-stone-600">
              Click any grid cell on the map to see detailed risk analysis
            </p>
          </div>
        </div>
      )}

      {/* ── Grid Risk Distribution ────────────────────────────────────── */}
      {distribution && (
        <div className="p-4 border-b border-orange-950/30">
          <p className="text-[10px] font-mono text-stone-500 uppercase tracking-wider mb-3">
            Zone Distribution
          </p>
          <div className="space-y-2">
            {distribution.map(({ label, count, pct }) => {
              const colorMap = {
                Low: '#22c55e', Moderate: '#eab308',
                High: '#f97316', Extreme: '#ef4444'
              }
              return (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-sm flex-shrink-0"
                       style={{ background: colorMap[label] }} />
                  <span className="text-[11px] text-stone-400 flex-1">{label}</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-16 h-1 bg-stone-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full"
                           style={{ width: `${pct}%`, background: colorMap[label], opacity: 0.7 }} />
                    </div>
                    <span className="text-[10px] font-mono text-stone-500 w-8 text-right">
                      {pct}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Total cells */}
          <div className="mt-3 pt-2 border-t border-stone-800 flex justify-between">
            <span className="text-[10px] text-stone-600">Grid cells analyzed</span>
            <span className="text-[10px] font-mono text-stone-400">
              {gridData.grid_cells.length}
            </span>
          </div>
        </div>
      )}

      {/* ── Model Info ────────────────────────────────────────────────── */}
      <div className="p-4 mt-auto">
        <div className="rounded-xl bg-stone-900/50 border border-stone-800 p-3">
          <p className="text-[9px] font-mono text-stone-600 uppercase tracking-widest mb-2">
            Model Info
          </p>
          {[
            ['Algorithm',  'XGBoost'],
            ['AUC Score',  '0.89'],
            ['Features',   '12'],
            ['Top Driver', 'Wind Alignment'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-0.5">
              <span className="text-[10px] text-stone-600">{k}</span>
              <span className="text-[10px] font-mono text-orange-400">{v}</span>
            </div>
          ))}
        </div>
      </div>

    </aside>
  )
}
