const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./index.html'],
  theme: {
    extend: {
      colors: {
        background: '#191A19',
        secondary: '#1E5128',
        primary: '#4E9F3D',
        highlight: '#D8E9A8',
      },
    },
  },
  plugins: [],
};
