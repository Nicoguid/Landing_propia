/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        graphite: '#292d30',
        bone: '#f0f0f0',
        ash: '#a1a4a5',
        'electric-blue': '#0070f3',
        'cyan-accent': '#38bdf8',
        'neon-blue': '#00e5ff',
        'pulse-green': '#3ad389',
        'alarm-red': '#ff9592',
      },
    },
  },
  plugins: [],
};
