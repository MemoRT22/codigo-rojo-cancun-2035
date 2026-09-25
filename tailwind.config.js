/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        vertice: {
          bg: '#0A1220',
          surface: '#0F1928',
          panel: '#152030',
          border: '#1E2E42',
          blue: '#1268E8',
          cyan: '#00AFC4',
          text: '#C8D6E5',
          'text-secondary': '#557086',
          'text-muted': '#4A6480',
          'text-bright': '#E8F0F8',
          warning: '#E8A020',
          danger: '#DC3545',
          success: '#22A86A',
          accent: '#1268E8',
          'accent-bright': '#3A8AFF',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'territory': '0 8px 32px rgba(19, 34, 56, 0.10)',
        'panel': '0 1px 3px rgba(19, 34, 56, 0.06)',
        'elevated': '0 4px 16px rgba(19, 34, 56, 0.08)',
      },
    },
  },
  plugins: [],
}
