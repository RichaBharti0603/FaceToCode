/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E3A8A',
        'primary-dark': '#0F2A44',
        'bg-main': '#0B1A2F',
        'bg-surface': 'rgba(255, 255, 255, 0.05)',
        'bg-elevated': 'rgba(255, 255, 255, 0.08)',
        border: 'rgba(255, 255, 255, 0.1)',
        'text-primary': '#F5F9FF',
        'text-secondary': '#5A6B85',
        'text-muted': '#3B4B65',
        error: '#FF4444',
        success: '#00C853',
        warning: '#FFB300',
        accent: '#C7A75D',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'sans-serif'],
        mono: ['Fira Mono', 'SF Mono', 'Courier New', 'monospace'],
        ui: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'card-hover': '0 20px 25px -12px rgba(227,242,253,0.1)',
        'btn-glow': '0 0 10px rgba(227,242,253,0.3), 0 0 5px rgba(227,242,253,0.3)',
        'modal': '0 25px 50px -12px rgba(0,0,0,0.5)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 300ms ease-in-out',
        'slide-up': 'slideUp 400ms ease-out',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: .5 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        }
      }
    },
  },
  plugins: [],
}