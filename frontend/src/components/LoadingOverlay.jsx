/**
 * LoadingOverlay.jsx — Full-map Loading State
 * =============================================
 * Shown while the backend is computing risk predictions.
 * Covers the map with a semi-transparent overlay + animated indicator.
 */

export default function LoadingOverlay() {
  return (
    <div className="absolute inset-0 z-[999] flex items-center justify-center
                    bg-stone-950/70 backdrop-blur-[2px]">
      <div className="flex flex-col items-center gap-4">
        {/* Fire ring animation */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-orange-500/30
                          animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-orange-500/50
                          animate-ping [animation-delay:200ms]" />
          <div className="absolute inset-4 rounded-full bg-orange-500/80 
                          flex items-center justify-center text-xl
                          animate-[flicker_1.5s_ease-in-out_infinite]">
            🔥
          </div>
        </div>

        <div className="text-center">
          <p className="font-display text-lg tracking-widest text-orange-400">
            ANALYZING
          </p>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Running XGBoost inference...
          </p>
        </div>

        {/* Fake progress steps */}
        <div className="space-y-1 text-left">
          {[
            '▶ Loading MODIS NDVI data...',
            '▶ Fetching NOAA weather...',
            '▶ Computing grid features...',
            '▶ Running XGBoost model...',
          ].map((step, i) => (
            <div
              key={step}
              className="text-[10px] font-mono text-stone-600 
                         animate-[fadeIn_0.5s_ease-out_forwards] opacity-0"
              style={{ animationDelay: `${i * 300}ms` }}
            >
              {step}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
