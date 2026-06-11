import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['DM Serif Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        cream: {
          50: '#faf8f5',
          100: '#f5f0eb',
          200: '#ebe4db',
          300: '#ddd3c6',
          400: '#c9b9a8',
        },
        warm: {
          500: '#8b7355',
          600: '#7a6248',
          700: '#5c4a36',
          800: '#3d3226',
          900: '#2a221a',
        },
        gold: {
          400: '#c9a84c',
          500: '#b8943f',
          600: '#9a7b32',
        },
        rating: {
          good: '#5a8a5e',
          fair: '#8b7355',
          high: '#b85c3c',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
