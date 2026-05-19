/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink:     '#e2d8cc',
        muted:   '#7a6e63',
        faint:   '#3d352e',
        bg:      '#0e0c0a',
        surface: '#141210',
        raised:  '#1c1915',
        edge:    '#2d2820',
        amber:   '#f0872d',
        grove:   '#5fb85f',
        ember:   '#e05252',
      },
      animation: {
        'pulse-amber': 'pulse-amber 2s ease-in-out infinite',
        'flow-amber':  'flow-amber 1.8s linear infinite',
        'slide-up':    'slide-up 0.25s ease-out',
        'fade-in':     'fade-in 0.3s ease-out',
        'blink':       'blink 1s step-end infinite',
      },
      keyframes: {
        'pulse-amber': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(240,135,45,0)' },
          '50%':       { boxShadow: '0 0 20px 5px rgba(240,135,45,0.22)' },
        },
        'flow-amber': {
          '0%':   { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(5px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
