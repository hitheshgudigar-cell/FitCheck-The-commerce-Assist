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
        warm: {
          50: '#FAF7F2',
          100: '#F5EFE6',
          200: '#E8DFC8',
          300: '#D8C9AA',
          400: '#B8A37E',
          500: '#947D54',
          800: '#2E2820',
          900: '#1C1914',
        },
        ink: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1F2933', // specified #1F2933
          900: '#0F172A',
          950: '#090D14',
        },
        teal: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E', // specified #0F766E deep teal primary
          800: '#115E59',
          900: '#134E4A',
          950: '#042F2E',
        },
        terracotta: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C', // specified #C2410C terracotta accent
          800: '#9A3412',
          900: '#7C2D12',
        },
        verdict: {
          yes: '#15803D',
          'yes-bg': '#F0FDF4',
          'yes-border': '#BBF7D0',
          'yes-dark-bg': '#052E16',
          'yes-dark-border': '#166534',
          
          no: '#B91C1C',
          'no-bg': '#FEF2F2',
          'no-border': '#FECACA',
          'no-dark-bg': '#450A0A',
          'no-dark-border': '#991B1B',

          unknown: '#B45309',
          'unknown-bg': '#FFFBEB',
          'unknown-border': '#FDE68A',
          'unknown-dark-bg': '#451A03',
          'unknown-dark-border': '#92400E',
        },
        dark: {
          bg: '#14171A',
          card: '#1C2128',
          cardMuted: '#242B35',
          border: '#2E3846',
          ink: '#F3F4F6',
          inkMuted: '#9CA3AF',
        }
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        'card': '14px',
      },
      boxShadow: {
        'soft': '0 2px 10px -2px rgba(31, 41, 51, 0.05), 0 1px 3px -1px rgba(31, 41, 51, 0.05)',
        'lifted': '0 8px 24px -4px rgba(31, 41, 51, 0.08), 0 2px 6px -2px rgba(31, 41, 51, 0.04)',
      },
      transitionDuration: {
        'subtle': '200ms',
      }
    },
  },
  plugins: [],
}
