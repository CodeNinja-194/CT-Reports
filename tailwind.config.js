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
        brand: {
          50: '#f0f4f9',
          100: '#dce5f1',
          200: '#b9cbe4',
          300: '#8baad1',
          400: '#5a84bb',
          500: '#3866a4',
          600: '#274f88',
          700: '#1f3e6e',
          800: '#1b345b',
          900: '#1b2a4a', // Deep Navy CodeTantra
          950: '#0f1930', // Deepest Navy
        },
        gold: {
          DEFAULT: '#b8860f',
          soft: '#d9a93a',
          light: '#fbf4e4',
          dark: '#8c6508',
        },
        paper: {
          DEFAULT: '#FAF7F0',
          line: '#E7E0D0',
          dark: '#0f172a',
        },
        pass: {
          DEFAULT: '#0e7c66',
          soft: '#e6f6f1',
          dark: '#3cc3a3',
        },
        fail: {
          DEFAULT: '#c4472d',
          soft: '#fdf0ed',
          dark: '#f0805f',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Public Sans', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
