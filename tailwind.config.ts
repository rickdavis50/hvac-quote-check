import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        paper: {
          DEFAULT: '#FAF7F2',
          deep: '#F2EDE4',
          edge: '#E5DDCF',
        },
        ink: {
          DEFAULT: '#161310',
          soft: '#3B352C',
          mute: '#7A7160',
          faint: '#A99F8C',
        },
        copper: {
          DEFAULT: '#B87333',
          deep: '#8F5722',
          bright: '#D08A45',
          tint: '#F2E3D2',
        },
        chamber: '#0D0B09',
        verdict: {
          good: '#47703F',
          fair: '#7A7160',
          high: '#A6432D',
        },
      },
      letterSpacing: {
        micro: '0.14em',
      },
    },
  },
  plugins: [],
} satisfies Config;
