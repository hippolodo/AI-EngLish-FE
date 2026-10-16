/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        brand: {
          blue: '#2d68ff',
          lightBlue: '#f0f5ff',
          dark: '#1e2026',
          cardBg: '#f8f9fc',
          subtext: '#64748b'
        }
      },
      fontSize: {
        xs: ['0.8125rem', { lineHeight: '1.5' }],
        sm: ['0.9375rem', { lineHeight: '1.6' }],
        base: ['1rem', { lineHeight: '1.625' }],
        md: ['1.0625rem', { lineHeight: '1.55' }],
        lg: ['1.1875rem', { lineHeight: '1.45' }],
        xl: ['1.375rem', { lineHeight: '1.35' }],
        '2xl': ['1.625rem', { lineHeight: '1.3' }],
        '3xl': ['2rem', { lineHeight: '1.25' }],
      },
    },
  },
  plugins: [],
}
