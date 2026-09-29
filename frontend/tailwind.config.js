/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#faf5ff',
          100: '#f3e6fd',
          200: '#e4cbfb',
          300: '#c99afa',
          400: '#a855f7',
          500: '#9333ea',
          600: '#820ad1',
          700: '#6b0aae',
          800: '#4a0e6b',
          900: '#3c0a5e',
          950: '#28073f',
        },
        ground: '#f6f2fa',
        ink: '#221229',
        muted: '#6f5b7e',
        faint: '#a48fb5',
      },
      fontFamily: {
        display: ['Poppins', 'system-ui', 'sans-serif'],
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 14px 34px -16px rgba(60, 10, 94, 0.28)',
        pop: '0 18px 50px -12px rgba(40, 7, 63, 0.45)',
      },
    },
  },
  plugins: [],
};
