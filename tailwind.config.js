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
        retro: {
          900: '#101a38',
          800: '#1b2a56',
          700: '#2a3c70',
          600: '#3b518c',
          accent: '#00f2fe',
          pink: '#ff007f',
          purple: '#7928ca',
          gold: '#ffd700',
          green: '#00ff88',
        },
      },
      fontFamily: {
        retro: ['"Press Start 2P"', 'monospace'],
        display: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 15px rgba(0, 242, 254, 0.4), 0 0 30px rgba(0, 242, 254, 0.2)',
        'neon-pink': '0 0 15px rgba(255, 0, 127, 0.4), 0 0 30px rgba(255, 0, 127, 0.2)',
        'neon-gold': '0 0 15px rgba(255, 215, 0, 0.4), 0 0 30px rgba(255, 215, 0, 0.2)',
      },
    },
  },
  plugins: [],
}
