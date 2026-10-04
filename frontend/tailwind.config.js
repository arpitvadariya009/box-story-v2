/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f7f6f5',
          100: '#edeae6',
          200: '#dcd5cc',
          300: '#c5b8a9',
          400: '#ab9783',
          500: '#947d67', // Warm BoxStories wooden theme
          600: '#806853',
          700: '#6a5442',
          800: '#574537',
          900: '#483a2e',
          950: '#261e18',
        }
      }
    },
  },
  plugins: [],
}
