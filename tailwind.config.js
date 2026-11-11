/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        rack: {
          900: '#0a0c10',
          850: '#101319',
          800: '#151922',
          750: '#1b202c',
          700: '#232a39',
          600: '#2f384c',
          500: '#434e68',
        },
        vintage: {
          cream: '#e5decf',
          gold: '#eab308',
          red: '#dc2626',
          green: '#16a34a',
          orange: '#ea580c',
          ledGreen: '#22c55e',
          ledRed: '#ef4444',
          ledAmber: '#f59e0b',
          ledCyan: '#06b6d4',
        },
      },
      fontFamily: {
        display: ['"Chakra Petch"', 'system-ui', 'sans-serif'],
        mono: ['"Share Tech Mono"', 'monospace'],
        body: ['"Space Grotesk"', 'sans-serif'],
      },
      boxShadow: {
        'rack-bevel': 'inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.8), 0 8px 24px rgba(0, 0, 0, 0.6)',
        'rack-panel': 'inset 1px 1px 1px rgba(255, 255, 255, 0.06), inset -1px -1px 2px rgba(0, 0, 0, 0.8), 0 4px 12px rgba(0, 0, 0, 0.5)',
        'knob-3d': '0 6px 12px rgba(0,0,0,0.7), inset 0 2px 2px rgba(255,255,255,0.25), inset 0 -2px 3px rgba(0,0,0,0.9)',
        'led-green-glow': '0 0 10px #22c55e, 0 0 20px rgba(34, 197, 94, 0.5)',
        'led-red-glow': '0 0 10px #ef4444, 0 0 20px rgba(239, 68, 68, 0.6)',
        'led-amber-glow': '0 0 10px #f59e0b, 0 0 20px rgba(245, 158, 11, 0.5)',
        'led-cyan-glow': '0 0 10px #06b6d4, 0 0 20px rgba(6, 182, 212, 0.5)',
        'switch-press': 'inset 0 3px 6px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.1)',
      },
      backgroundImage: {
        'brushed-metal': 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.4) 100%), linear-gradient(180deg, #181c25 0%, #101319 100%)',
        'knob-metal': 'radial-gradient(circle at 40% 40%, #3a4254 0%, #1a1e28 65%, #0e1117 100%)',
        'wood-cheek': 'linear-gradient(90deg, #3d2010 0%, #572f17 40%, #2f1709 100%)',
      },
    },
  },
  plugins: [],
}
