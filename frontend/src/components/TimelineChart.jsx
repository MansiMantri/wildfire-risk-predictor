/**
 * TimelineChart.jsx — 72-Hour Risk Timeline
 * ============================================
 * Area chart showing how wildfire spread risk evolves
 * hour by hour over the next 72 hours.
 * 
 * Features:
 * - Gradient fill that shifts from green → red as risk increases
 * - Reference lines at 25%, 50%, 75% risk thresholds
 * - Tooltips with full weather data per time step
 * - Animated entry on data load
 */

import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, CartesianGrid
} from 'recharts'


// Custom gradient definitions (rendered as SVG defs)
const GRADIENT_ID = 'riskGradient'

function GradientDef() {
  return (
    <defs>
      <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor="#ef4444" stopOpacity={0.8} />
        <stop offset="40%"  stopColor="#f97316" stopOpacity={0.5} />
        <stop offset="100%" stopColor="#f97316" stopOpacity={0.05} />
      </linearGradient>
    </defs>
  )
}


// Custom dot — only show on extreme risk hours
const CustomDot = (props) => {
  const { cx, cy, payload } = props
  if (payload.risk > 0.70) {
    return (
      <circle cx={cx} cy={cy} r={3} fill="#ef4444" stroke="#fff" strokeWidth={1} />
    )
  }
  return null
}


// Custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    const d = payload[0].payload
    const risk = d.risk
    const color = risk < 0.25 ? '#22c55e'
                : risk < 0.50 ? '#eab308'
                : risk < 0.75 ? '#f97316'
                : '#ef4444'

    return (
      <div className="bg-stone-900 border border-stone-700 rounded-lg p-3 text-xs shadow-xl">
        <div className="font-mono text-stone-400 mb-2">
          +{d.hour}h from now
        </div>
        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="font-display text-2xl" style={{ color }}>
            {(risk * 100).toFixed(1)}%
          </span>
          <span className="text-stone-500 text-[10px]">spread risk</span>
        </div>
        <div className="space-y-0.5 border-t border-stone-800 pt-2">
          <div className="flex justify-between gap-6">
            <span className="text-stone-600">Wind</span>
            <span className="font-mono text-stone-300">{d.wind_speed} km/h</span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-stone-600">Humidity</span>
            <span className="font-mono text-stone-300">{d.humidity}%</span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-stone-600">Temp</span>
            <span className="font-mono text-stone-300">{d.temp}°C</span>
          </div>
        </div>
      </div>
    )
  }
  return null
}


export default function TimelineChart({ data }) {
  if (!data) {
    return (
      <div className="h-full flex flex-col p-3">
        <div className="w-36 h-3 rounded shimmer mb-2" />
        <div className="flex-1 rounded-xl shimmer" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-1 flex-shrink-0">
        <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider">
          72-Hour Risk Forecast
        </span>
        <div className="flex items-center gap-3 text-[9px] font-mono text-stone-700">
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 inline-block bg-red-500/60 rounded" />
            Extreme &gt;70%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 inline-block bg-orange-500/60 rounded" />
            High &gt;50%
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 4, right: 16, bottom: 0, left: -10 }}
          >
            <GradientDef />

            <CartesianGrid
              strokeDasharray="2 4"
              stroke="rgba(87,83,78,0.2)"
              vertical={false}
            />

            {/* Risk threshold reference lines */}
            <ReferenceLine y={0.70} stroke="#ef4444" strokeDasharray="3 4" strokeOpacity={0.4}
                           label={{ value: '70%', fill: '#ef4444', fontSize: 8, position: 'right' }} />
            <ReferenceLine y={0.50} stroke="#f97316" strokeDasharray="3 4" strokeOpacity={0.3}
                           label={{ value: '50%', fill: '#f97316', fontSize: 8, position: 'right' }} />
            <ReferenceLine y={0.25} stroke="#22c55e" strokeDasharray="3 4" strokeOpacity={0.2}
                           label={{ value: '25%', fill: '#22c55e', fontSize: 8, position: 'right' }} />

            <XAxis
              dataKey="hour"
              tick={{ fontSize: 8, fill: '#57534e', fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(h) => h === 0 ? 'Now' : `+${h}h`}
              interval={7}
            />
            <YAxis
              domain={[0, 1]}
              tick={{ fontSize: 8, fill: '#57534e', fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            />
            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="risk"
              stroke="#f97316"
              strokeWidth={1.5}
              fill={`url(#${GRADIENT_ID})`}
              dot={<CustomDot />}
              activeDot={{ r: 4, fill: '#f97316', stroke: '#fff', strokeWidth: 1.5 }}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
