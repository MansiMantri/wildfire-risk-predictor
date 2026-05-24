/**
 * StatsBar.jsx — Top Metrics Row
 * ================================
 * Displays key model and data stats across a single bar.
 * Gives the dashboard an immediate data-science "command center" feel.
 */

import { Database, Wind, Target, Clock, TrendingUp, AlertTriangle } from 'lucide-react'

const StatItem = ({ icon: Icon, label, value, color = 'orange', animate = false }) => {
  const colorMap = {
    orange: 'text-orange-400',
    red:    'text-red-400',
    blue:   'text-sky-400',
    green:  'text-emerald-400',
    amber:  'text-amber-400',
  }

  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 
                    border-r border-orange-950/40 last:border-0">
      <div className={`${colorMap[color]} opacity-80`}>
        <Icon size={13} />
      </div>
      <div>
        <div className={`text-xs font-mono font-semibold ${colorMap[color]} 
                         ${animate ? 'animate-[flicker_2s_ease-in-out_infinite]' : ''}`}>
          {value}
        </div>
        <div className="text-[10px] text-stone-600 uppercase tracking-wider leading-none mt-0.5">
          {label}
        </div>
      </div>
    </div>
  )
}


export default function StatsBar({ stats }) {
  if (!stats) {
    // Skeleton loading state
    return (
      <div className="flex border-b border-orange-950/40 bg-stone-950/50 overflow-x-auto">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-2.5 px-4 py-2.5 border-r border-orange-950/40">
            <div className="w-3 h-3 rounded shimmer" />
            <div>
              <div className="w-12 h-3 rounded shimmer mb-1" />
              <div className="w-16 h-2 rounded shimmer" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex border-b border-orange-950/40 bg-stone-950/50 overflow-x-auto">

      <StatItem
        icon={Target}
        label="Model AUC"
        value={`${stats.model_auc}`}
        color="green"
      />

      <StatItem
        icon={Database}
        label="Training Samples"
        value={stats.training_samples.toLocaleString()}
        color="blue"
      />

      <StatItem
        icon={Wind}
        label="Top Driver"
        value={stats.top_driver}
        color="amber"
      />

      <StatItem
        icon={Clock}
        label="Prediction Window"
        value={stats.prediction_window}
        color="orange"
      />

      <StatItem
        icon={AlertTriangle}
        label="Demo Active Fires"
        value={stats.california_active_fires}
        color="red"
        animate
      />

      <StatItem
        icon={TrendingUp}
        label="High Risk Zones"
        value={stats.high_risk_zones}
        color="orange"
      />

      {/* Data Sources tag */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 ml-auto flex-shrink-0">
        <span className="text-[10px] text-stone-600 uppercase tracking-wider">Sources:</span>
        {stats.data_sources.map((src) => (
          <span key={src}
                className="px-1.5 py-0.5 rounded text-[9px] font-mono 
                           bg-stone-800 text-stone-400 border border-stone-700">
            {src}
          </span>
        ))}
      </div>

    </div>
  )
}
