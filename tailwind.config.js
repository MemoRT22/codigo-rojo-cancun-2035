/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        vertice: {
          bg: '#0a0e14',
          surface: '#111820',
          panel: '#151c26',
          border: '#1e2a38',
          accent: '#2a8a8a',
          'accent-bright': '#3bb5b0',
          text: '#c8d6e5',
          'text-muted': '#6b7f95',
          'text-bright': '#e8f0f8',
          warning: '#d4913a',
          'warning-bright': '#f0a848',
          danger: '#c0392b',
          'danger-bright': '#e74c3c',
          success: '#27ae60',
          'success-bright': '#2ecc71',
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
