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
          DEFAULT: '#01333A',
          50: '#F0F9F9',
          100: '#E0F3F2',
          200: '#B2E2E0',
          300: '#80CECB',
          400: '#2A9D90',
          500: '#008F83',
          600: '#015B63',
          700: '#01474D',
          800: '#01333A',
          900: '#002227',
        },
        teal: {
          brand: '#14B8A6',
          dark: '#0D9488',
          light: '#CCFBF1',
          50: '#F0FDFA',
          100: '#CCFBF1',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
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
