/**
 * SHAPChart.jsx — Feature Importance Visualization
 * ==================================================
 * Horizontal bar chart showing SHAP values for each feature.
 * SHAP (SHapley Additive exPlanations) = "how much does each
 * feature contribute to the model's prediction?"
 * 
 * Wind Alignment is #1 — this confirms to recruiters that
 * you understand your model, not just ran sklearn.fit().
 */

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'

// Colors for top features (gradient from most to least important)
const BAR_COLORS = [
  '#ef4444', '#f97316', '#fb923c', '#fbbf24',
  '#fcd34d', '#fde68a', '#d1d5db', '#9ca3af',
  '#6b7280', '#4b5563', '#374151', '#1f2937'
]

// Custom tooltip for the SHAP chart
const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const d = payload[0].payload
    return (
      <div className="bg-stone-900 border border-stone-700 rounded-lg p-3 text-xs shadow-xl max-w-[220px]">
        <div className="font-mono text-orange-300 font-semibold mb-1">
          {d.feature.replace(/_/g, ' ').toUpperCase()}
        </div>
        <div className="text-stone-400 text-[10px] mb-2">{d.description}</div>
        <div className="flex justify-between gap-4">
          <span className="text-stone-500">SHAP Value</span>
          <span className="font-mono text-orange-400">{d.shap_value.toFixed(4)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-stone-500">Importance</span>
          <span className="font-mono text-amber-400">{d.percentage}%</span>
        </div>
      </div>
    )
  }
  return null
}


export default function SHAPChart({ data }) {
  if (!data) {
    return (
      <div className="h-full flex flex-col p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-20 h-3 rounded shimmer" />
        </div>
        <div className="flex-1 space-y-2 px-1">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-16 h-2 rounded shimmer" />
              <div className="flex-1 h-2 rounded shimmer" style={{ opacity: 1 - i * 0.15 }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Show top 8 features only (fits the panel)
  const chartData = data.slice(0, 8).map(d => ({
    ...d,
    // Shorten feature names for display
    shortName: d.feature
      .replace('_index', '')
      .replace('_speed', '')
      .replace('_alignment', '_align')
      .replace('_moisture', '_moist')
      .replace('distance_to_fire', 'dist_fire')
      .replace(/_/g, ' ')
  }))

  return (
    <div className="h-full flex flex-col p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-1 flex-shrink-0">
        <div>
          <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider">
            SHAP Feature Importance
          </span>
          <span className="ml-2 text-[9px] text-orange-500/70 font-mono">
            wind_alignment #1
          </span>
        </div>
        <span className="text-[9px] font-mono text-stone-700">XGBoost TreeExplainer</span>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 2, right: 40, bottom: 2, left: 0 }}
          >
            <XAxis
              type="number"
              tick={{ fontSize: 8, fill: '#57534e', fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="shortName"
              width={68}
              tick={{ fontSize: 9, fill: '#78716c', fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(249,115,22,0.05)' }}
            />
            <Bar dataKey="shap_value" radius={[0, 3, 3, 0]}>
              {chartData.map((_, idx) => (
                <Cell key={idx} fill={BAR_COLORS[idx] || '#374151'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
