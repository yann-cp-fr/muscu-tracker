/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Palette sombre inspirée d'Apple Fitness / Hevy (sans les copier)
        bg: '#0a0a0a',
        surface: '#1a1a1c',
        'surface-2': '#242427',
        border: '#323236',
        accent: '#3b82f6',
        'accent-dim': '#1e3a5f',
        success: '#22c55e',
        muted: '#8e8e93',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
