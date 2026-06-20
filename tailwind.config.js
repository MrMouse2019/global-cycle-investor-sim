/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#172033',
        paper: '#f6f2ea',
        gold: '#c88f3d',
        bull: '#d94b4b',
        bear: '#2f9a67',
      },
      boxShadow: {
        soft: '0 18px 45px rgba(23, 32, 51, 0.12)',
      },
    },
  },
  plugins: [],
}
