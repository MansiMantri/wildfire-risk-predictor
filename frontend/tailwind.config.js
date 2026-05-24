/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bebas Neue"', 'cursive'],
        mono:    ['"JetBrains Mono"', 'monospace'],
        body:    ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        ember:   { 400: '#fb923c', 500: '#f97316', 600: '#ea580c', 900: '#431407' },
        ash:     { 50: '#fafaf9', 100: '#f5f5f4', 800: '#292524', 900: '#1c1917', 950: '#0c0a09' },
        smoke:   { 700: '#374151', 800: '#1f2937', 900: '#111827' },
      },
      animation: {
        'pulse-slow':   'pulse 3s ease-in-out infinite',
        'flicker':      'flicker 2s ease-in-out infinite',
        'slide-up':     'slideUp 0.6s ease-out forwards',
        'fade-in':      'fadeIn 0.8s ease-out forwards',
        'glow':         'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.7' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        glow: {
          from: { boxShadow: '0 0 10px rgba(249, 115, 22, 0.3)' },
          to:   { boxShadow: '0 0 30px rgba(249, 115, 22, 0.7)' },
        }
      }
    },
  },
  plugins: [],
}
