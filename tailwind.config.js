/**
 * Tokens de marca SMD. Viven aqui, NO repartidos como valores arbitrarios en el JSX
 * (SPEC §2.5). Los pares granate/crema cumplen los contrastes exigidos en CA-39.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Granate de marca. 700 sobre crema-50 = 8.9:1. Blanco sobre 700 = 8.4:1.
        marca: {
          50: '#FBF2F4',
          100: '#F5DFE4',
          200: '#E7B6C0',
          300: '#D4808F',
          400: '#B94F63',
          500: '#A0334A',
          600: '#8C1D33',
          700: '#75162A',
          800: '#5A1120',
          900: '#3F0C17',
        },
        // Pergamino del banner y los chips.
        crema: {
          50: '#FDFAF5',
          100: '#F8F1E4',
          200: '#F0E3CC',
          300: '#E4D2B0',
          400: '#D2B98A',
        },
        tinta: {
          500: '#6B6257',
          700: '#4A443C',
          900: '#241F1A',
        },
      },
      fontFamily: {
        titulo: ['"Libre Baskerville"', 'Georgia', 'serif'],
        cuerpo: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        tarjeta: '0 1px 2px rgba(36, 31, 26, 0.06), 0 8px 24px -12px rgba(36, 31, 26, 0.18)',
      },
    },
  },
  plugins: [],
};
