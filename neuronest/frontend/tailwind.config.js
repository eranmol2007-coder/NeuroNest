/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#e0fcff',
          100: '#b3f5fc',
          200: '#81ecf8',
          300: '#4fe3f4',
          400: '#26dbf1',
          500: '#00d4ee',
          600: '#00b8cc',
          700: '#008fa0',
          800: '#006674',
          900: '#003d47',
        },
        gold: {
          300: '#f0d9a0',
          400: '#dfc280',
          500: '#c9a960',
          600: '#b89240',
          700: '#9a7a30',
        },
        dark: {
          900: '#050a18',
          800: '#0a1025',
          700: '#0f1630',
          600: '#141c3a',
          500: '#1a2345',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0,0,0,0.36)',
        'glass-sm': '0 2px 16px 0 rgba(0,0,0,0.24)',
        'glass-lg': '0 16px 48px 0 rgba(0,0,0,0.44)',
        'glow': '0 0 40px rgba(0,212,238,0.15)',
        'glow-gold': '0 0 40px rgba(201,169,96,0.15)',
        'float': '0 25px 50px -12px rgba(0,0,0,0.5)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in': 'fade-in 0.5s ease forwards',
        'scale-in': 'scale-in 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'spin-slow': 'spin-slow 20s linear infinite',
      },
    },
  },
  plugins: [],
};
