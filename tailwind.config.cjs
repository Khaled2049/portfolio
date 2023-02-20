/** @type {import('tailwindcss').Config} */
const withMT = require('@material-tailwind/react/utils/withMT');

module.exports = withMT({
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

  theme: {
    extend: {
      colors: {
        highlight: '#fbbf24',
        bg: '#31324c',
        primary: '#fbc567',
        secondary: '#f2596b',
      },
      fontFamily: {
        roboto: ['Roboto Mono', 'monospace'],
        rubik: ['Rubik', 'sans-serif'],
      },
    },
  },
  plugins: [],
});
