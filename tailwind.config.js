/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        brand: {
          blue: '#2d68ff',
          lightBlue: '#f0f5ff',
          dark: '#0f172a',
          cardBg: '#f8f9fc',
          subtext: '#64748b'
        }
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'spring-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        pulseRing: {
          '0%': { transform: 'scale(0.95)', opacity: '0.75' },
          '50%': { transform: 'scale(1.28)', opacity: '0.25' },
          '100%': { transform: 'scale(1.55)', opacity: '0' }
        },
        wave: {
          '0%, 100%': { height: '8px' },
          '50%': { height: '32px' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        }
      },
      animation: {
        'shimmer': 'shimmer 2.2s infinite',
        'pulse-ring': 'pulseRing 2s cubic-bezier(0.16, 1, 0.3, 1) infinite',
        'wave': 'wave 1.2s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
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
