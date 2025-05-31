/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        'vert-black': '#0A0A0A',
        'vert-gray': '#1A1A1A',
        'vert-accent': '#00FFA3',
        'vert-secondary': '#33FF99',
        'vert-dark': '#005f4a',
      },
      fontFamily: {
        comic: ['"Bangers"', 'cursive'],
        'urban': ['Urbanist', 'sans-serif'],
      },
      boxShadow: {
        cel: '4px 4px 0px #000000',
        'cel-hover': '2px 2px 0px #000000',
      },
    },
  },
  plugins: [],
} 