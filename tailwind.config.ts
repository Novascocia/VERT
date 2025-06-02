import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'vert-black': '#0A0A0A',
        'vert-dark': '#0A0A0A',
        'vert-gray': '#1A1A1A',
        'vert-accent': '#FF3366',
        'vert-secondary': '#33FF99',
        'vert-green': '#50D64D',
        'vert-forest': '#0F3B1E',
        'vert-gold': '#F4B942',
        'vert-matte-black': '#111111',
        'vert-white': '#FFFFFF',
        'vert-urban-gray': '#888888',
        'vert-ash': '#F2F2F2',
      },
      fontFamily: {
        'comic': ['Bangers', 'cursive'],
        'urban': ['Urbanist', 'sans-serif'],
      },
      boxShadow: {
        'cel': '4px 4px 0px 0px rgba(0, 0, 0, 1)',
        'cel-hover': '6px 6px 0px 0px rgba(0, 0, 0, 1)',
      },
      animation: {
        'pop': 'pop 0.3s ease-out',
        'blink': 'blink 1s step-start infinite',
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
export default config 