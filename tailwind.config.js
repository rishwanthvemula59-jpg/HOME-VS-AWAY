/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Chakra Petch"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        pitch: {
          50: '#f8faf9',
          100: '#edf4f1',
          200: '#d7e7e0',
          300: '#b4d3c6',
          400: '#86b6a3',
          500: '#5e9983',
          600: '#477c6a',
          700: '#3a6456',
          800: '#2f4f45',
          900: '#28423a',
          950: '#142520',
        },
        floodlight: {
          amber: '#f59e0b',
          gold: '#eab308',
          glow: '#fde047',
        },
        turf: {
          emerald: '#10b981',
          vibrant: '#059669',
          deep: '#065f46',
        }
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
