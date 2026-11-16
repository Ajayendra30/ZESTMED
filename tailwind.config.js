/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#005CB9',
          50: '#F0F6FE',
          100: '#E1EFFF',
          200: '#B8DCFE',
          300: '#85C1FD',
          400: '#3D9EFA',
          500: '#005CB9',
          600: '#004C99',
          700: '#003E7D',
          800: '#002E5C',
          900: '#0A1E34',
        },
        accent: {
          DEFAULT: '#FF5722',
          50: '#FFF5F0',
          100: '#FFE7DB',
          200: '#FFCEB5',
          300: '#FFAA85',
          400: '#FF8050',
          500: '#FF5722',
          600: '#E64A19',
          700: '#C2380A',
        },
        navy: {
          DEFAULT: '#0A1E34',
          light: '#0E2847',
          dark: '#071524',
        },
        teal: {
          brand: '#005CB9',
          dark: '#004C99',
          light: '#DBEAFE',
          50: '#F0F6FE',
          100: '#E1EFFF',
          200: '#B8DCFE',
          500: '#005CB9',
          600: '#004C99',
          700: '#003E7D',
        },
        dark: {
          DEFAULT: '#1E293B',
          soft: '#334155',
          heading: '#0F172A',
        },
        muted: {
          DEFAULT: '#64748B',
          light: '#94A3B8',
        },
        surface: {
          DEFAULT: '#F8FAFC',
          card: '#FFFFFF',
          alt: '#F1F5F9',
        },
        border: {
          DEFAULT: '#E2E8F0',
          light: '#F1F5F9',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'subtle': '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 12px 24px -4px rgba(22, 119, 200, 0.12), 0 8px 16px -4px rgba(0, 0, 0, 0.04)',
        'dropdown': '0 10px 30px -5px rgba(15, 23, 42, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
