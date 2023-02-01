/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './src/_app.tsx'],
  theme: {
    extend: {
      colors: {
        primary: '#3512C4',
        secondary: '#480355',
        'cornflower-blue': '#7699D4',
      },
    },
  },
  plguins: [],
};
