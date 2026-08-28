/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          100: '#f7e4e0',
          700: '#7a2d2d',
          800: '#5b1a1a',
        },
      },
      boxShadow: {
        soft: '0 20px 48px rgba(51, 40, 16, 0.08)',
      },
    },
  },
  plugins: [],
}

