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
        xs: ['0.875rem', { lineHeight: '1.5' }], // 14px
        sm: ['1rem', { lineHeight: '1.6' }], // 16px
        base: ['1.0625rem', { lineHeight: '1.625' }], // 17px
        md: ['1.125rem', { lineHeight: '1.55' }], // 18px
        lg: ['1.25rem', { lineHeight: '1.45' }], // 20px
        xl: ['1.5rem', { lineHeight: '1.35' }], // 24px
        '2xl': ['1.875rem', { lineHeight: '1.3' }], // 30px
        '3xl': ['2.25rem', { lineHeight: '1.25' }], // 36px
        '4xl': ['2.75rem', { lineHeight: '1.2' }], // 44px
      },
    },
  },
  plugins: [],
}
