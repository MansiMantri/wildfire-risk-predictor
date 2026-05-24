/**
 * Header.jsx — Top Navigation Bar
 * =================================
 * Shows the app title, model badge, and location search.
 * The picker provides sample wildfire-prone locations across regions.
 */

import { useState } from 'react'
import { Flame, Cpu, Satellite, MapPin, ChevronDown } from 'lucide-react'

// Sample locations; predictions are generated demo risk estimates.
const PRESET_LOCATIONS = [
  { name: 'Sierra Nevada, California', lat: 37.5, lng: -119.5 },
  { name: 'Paradise, California', lat: 39.75, lng: -121.62 },
  { name: 'Boulder, Colorado', lat: 40.02, lng: -105.27 },
  { name: 'Maui, Hawaii', lat: 20.8, lng: -156.33 },
  { name: 'Uttarakhand, India', lat: 30.07, lng: 79.02 },
  { name: 'Himachal Pradesh, India', lat: 31.1, lng: 77.17 },
  { name: 'Simlipal, Odisha, India', lat: 21.92, lng: 86.37 },
  { name: 'Nilgiris, Tamil Nadu, India', lat: 11.41, lng: 76.7 },
  { name: 'Blue Mountains, Australia', lat: -33.71, lng: 150.31 },
  { name: 'Athens, Greece', lat: 37.98, lng: 23.73 },
  { name: 'Kelowna, Canada', lat: 49.89, lng: -119.5 },
  { name: 'Cape Town, South Africa', lat: -33.92, lng: 18.42 },
]

const formatCoordinate = (value, positive, negative) =>
  `${Math.abs(value).toFixed(1)}${value >= 0 ? positive : negative}`

export default function Header({ onSearch, currentLocation }) {
  const [showPresets, setShowPresets] = useState(false)

  const handlePreset = (loc) => {
    onSearch(loc)
    setShowPresets(false)
  }

  return (
    <header className="relative z-[1100] flex items-center gap-6 px-6 py-3 
                        border-b border-orange-950/60 bg-[#0c0a09]"
            style={{ minHeight: '60px' }}>

      {/* ── Brand Logo + Title ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="relative">
          {/* Animated fire icon */}
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 
                          flex items-center justify-center shadow-lg shadow-orange-950/50
                          animate-[glow_2s_ease-in-out_infinite_alternate]">
            <Flame size={18} className="text-white" fill="white" />
          </div>
          {/* Live indicator dot */}
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full 
                           bg-orange-500 border-2 border-[#0c0a09] pulse-dot" />
        </div>

        <div>
          <h1 className="font-display text-2xl leading-none tracking-wider fire-text">
            PYROCAST
          </h1>
          <p className="text-[10px] text-stone-500 font-mono tracking-widest uppercase">
            Wildfire Risk Predictor
          </p>
        </div>
      </div>

      {/* ── Model Badge ───────────────────────────────────────────────────── */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg 
                      bg-orange-950/30 border border-orange-900/40">
        <Cpu size={12} className="text-orange-400" />
        <span className="text-xs font-mono text-orange-300">XGBoost</span>
        <span className="text-xs font-mono text-stone-500">|</span>
        <span className="text-xs font-mono text-orange-400">AUC 0.89</span>
      </div>

      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg 
                      bg-sky-950/30 border border-sky-900/40">
        <Satellite size={12} className="text-sky-400" />
        <span className="text-xs font-mono text-sky-300">NASA FIRMS</span>
        <span className="text-xs font-mono text-stone-500">+</span>
        <span className="text-xs font-mono text-sky-300">MODIS NDVI</span>
      </div>

      {/* ── Location Search ───────────────────────────────────────────────── */}
      <div className="flex-1 flex justify-end">
        <div className="relative w-72">

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl 
                          bg-stone-900 border border-stone-700 hover:border-orange-700/50
                          transition-colors cursor-pointer"
               onClick={() => setShowPresets(!showPresets)}>
            <MapPin size={14} className="text-orange-400 flex-shrink-0" />
            <span className="text-sm text-stone-300 flex-1 truncate">
              {currentLocation?.name || 'Select location...'}
            </span>
            <ChevronDown
              size={14}
              className={`text-stone-500 transition-transform duration-200 
                         ${showPresets ? 'rotate-180' : ''}`}
            />
          </div>

          {/* Dropdown */}
          {showPresets && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50
                            bg-stone-900 border border-stone-700 rounded-xl 
                            overflow-hidden shadow-2xl shadow-black/60">
              <div className="px-3 py-2 border-b border-stone-800">
                <p className="text-[10px] text-stone-500 font-mono uppercase tracking-wider">
                  Demo Wildfire Risk Locations
                </p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {PRESET_LOCATIONS.map((loc) => (
                  <button
                    key={loc.name}
                    onClick={() => handlePreset(loc)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm
                               text-stone-300 hover:bg-orange-950/40 hover:text-orange-300
                               transition-colors text-left border-b border-stone-800/50 last:border-0"
                  >
                    <MapPin size={12} className="text-stone-600 flex-shrink-0" />
                    <span className="truncate">{loc.name}</span>
                    <span className="ml-auto text-[9px] text-stone-600 font-mono flex-shrink-0">
                      {formatCoordinate(loc.lat, 'N', 'S')}, {formatCoordinate(loc.lng, 'E', 'W')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
