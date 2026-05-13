/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        surface: '#faf9f7',
        base: '#f5f4f1',
        border: '#e7e5e4',
        muted: '#a09e9b',
        subtle: '#6b6966',
        ink: '#1a1917',
        clay: 'var(--clay, #b89878)',
        'clay-light': '#ede4d8',
        'clay-dark': '#8a6e52',
      },
    },
  },
  plugins: [],
}

