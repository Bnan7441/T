/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#184277',
          primaryDark: '#0a1d37',
          secondary: '#0f172a',
          accent: '#2f6969', /* Darkened from #397c7c for >4.5:1 contrast */
          accentDark: '#255454',
          surface: '#f8fafc',
          card: '#ffffff',
          textMain: '#1e293b',
          textMuted: '#64748b',
        }
      },
      fontFamily: {
        vazir: ['Vazirmatn', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(24, 66, 119, 0.08)',
        'premium': '0 20px 40px -15px rgba(24, 66, 119, 0.15)',
        'glow': '0 0 20px rgba(57, 124, 124, 0.25)',
        'card-hover': '0 30px 60px -12px rgba(24, 66, 119, 0.12)',
      },
      borderRadius: {
        'sm': '0.5rem',
        'base': '1rem',
        'lg': '1.5rem',
        'xl': '2rem',
      },
      fontSize: {
        'fluid-base': 'clamp(1rem, 3vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 3.5vw, 1.25rem)',
        'fluid-xl': 'clamp(1.25rem, 4vw, 1.5rem)',
        'fluid-2xl': 'clamp(1.5rem, 5vw, 2rem)',
      },
      spacing: {
        'mobile-nav': '4rem',
        'safe-bottom': 'calc(4rem + env(safe-area-inset-bottom))',
      },

      zIndex: {
        'header': '50',
        'mobile-nav': '60',
        'drawer': '100',
        'sidebar': '110',
        'sidebar-overlay': '105',
        'modal-backdrop': '150',
        'modal': '160',
        'toast': '200',
      },

      animation: {
        'pulse-soft': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    }
  },
  plugins: [],
}
