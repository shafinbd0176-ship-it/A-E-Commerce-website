/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../shared/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sl: {
          bg: '#0f172a',        // Deep Charcoal 60%
          surface: '#1e293b',   // Slate Container 30%
          surfaceHover: '#334155',
          border: '#334155',
          accent: '#06b6d4',    // Electric Cyan 10%
          accentHover: '#0891b2',
          textMain: '#f8fafc',
          textMuted: '#94a3b8',
          emerald: '#10b981',
          purple: '#a855f7',
          amber: '#f59e0b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace']
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -5px rgba(6, 182, 212, 0.3)',
        'glow-emerald': '0 0 20px -5px rgba(16, 185, 129, 0.3)'
      }
    },
  },
  plugins: [],
}
