/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: '#e8192c',
        'brand-dark': '#c0121f',
        'brand-light': '#fff0f1',
      },
      fontFamily: {
        cn: ['"Noto Sans SC"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}