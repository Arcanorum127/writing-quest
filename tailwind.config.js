/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'fantasy': {
          900: '#1a1625',
          800: '#2d1b3d',
          700: '#3f2654',
          600: '#52316b',
          500: '#663c82',
          400: '#7a4799',
          300: '#8e52b0',
          200: '#a25dc7',
          100: '#b668de',
        }
      }
    },
  },
  plugins: [],
}