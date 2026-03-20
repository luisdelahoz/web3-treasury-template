/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Syne', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      colors: {
        bg:       '#080c10',
        surface:  '#0d1318',
        surface2: '#111920',
        border:   '#1e2d3a',
        border2:  '#243544',
        eth:      '#627eea',
        poly:     '#8247e5',
        green:    '#00e5a0',
        amber:    '#f5a623',
        crimson:  '#ff4d6d',
        text:     '#e8f0f7',
        muted:    '#4a6070',
        dim:      '#2a3d50',
      },
      animation: {
        'pulse-dot': 'pulse-dot 2s infinite',
        'shimmer':   'shimmer 1.4s infinite',
        'spin-slow': 'spin 0.8s linear infinite',
        'fade-up':   'fade-up 0.35s ease both',
      },
      keyframes: {
        'pulse-dot': {
          '0%,100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(0,229,160,0.4)' },
          '50%':     { opacity: '0.6', boxShadow: '0 0 0 4px rgba(0,229,160,0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
