/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        "c-black": "#1c2832",
        "c-white": "#d9d9d9",
        "c-red": "#eb321a",
        "c-blue": "#43aaf7",
      },
    },
  },
  plugins: [],
};
