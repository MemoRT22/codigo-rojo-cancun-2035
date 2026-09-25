/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        vertice: {
          bg: '#050B12',
          surface: '#0A1624',
          panel: '#0F1F33',
          border: '#1A2A3E',
          blue: '#2878FF',
          cyan: '#00C2D8',
          text: '#c8d6e5',
          'text-muted': '#4A6480',
          'text-bright': '#E8F0F8',
          warning: '#FF9F1C',
          danger: '#FF3B3B',
          success: '#34D399',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
