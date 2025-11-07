import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Dark theme colors
        page: { dark: '#0B0E11', light: '#F5F7FA' },
        surface: {
          1: { dark: '#15181D', light: '#EBEFF3' },
          2: { dark: '#1B2027', light: '#E2E7EC' },
        },
        stroke: { dark: '#262D36', light: '#D5DCE3' },
        text1: { dark: '#E6E8EB', light: '#1E2329' },
        text2: { dark: '#9FA8B3', light: '#626A74' },
        accent: { dark: '#4BB7FF', light: '#0A72D1' },
        success: { dark: '#44D07B', light: '#2CA763' },
        error: { dark: '#D24A50', light: '#CC3A42' },
        // Legacy support
        background: '#0b0e11',
        foreground: '#e6e8eb',
        muted: '#9fa8b3',
        border: '#262d36',
        panel: '#1b2027',
      },
      boxShadow: {
        elev1_dark: '0 8px 32px rgba(0,0,0,0.22)',
        elev1_light: '0 8px 24px rgba(0,0,0,0.10)',
        inner_dark: 'inset 0 1px 0 rgba(255,255,255,0.05)',
        inner_light: 'inset 0 1px 0 rgba(0,0,0,0.05)',
        glow_accent: '0 0 12px rgba(75,183,255,0.15)',
      },
      borderRadius: {
        card: '10px',
        btn: '8px',
      },
      fontFamily: {
        display: ['"Neue Haas Grotesk Display"', 'Inter Tight', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        code: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-1': ['40px', { lineHeight: '48px', letterSpacing: '-0.4px', fontWeight: '700' }],
        'display-2': ['28px', { lineHeight: '34px', letterSpacing: '-0.28px', fontWeight: '600' }],
        'body-m': ['16px', { lineHeight: '24px', letterSpacing: '-0.16px', fontWeight: '400' }],
        'body-s': ['14px', { lineHeight: '22px', letterSpacing: '-0.14px', fontWeight: '400' }],
        'micro': ['12px', { lineHeight: '18px', letterSpacing: '0', fontWeight: '400' }],
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.16,1,0.3,1)',
      },
      transitionDuration: {
        'default': '230ms',
        'hover': '120ms',
      },
      keyframes: {
        orbPulse: {
          '0%, 100%': { 
            transform: 'scale(1)', 
            filter: 'brightness(1)',
            opacity: '0.3',
          },
          '50%': { 
            transform: 'scale(1.08)', 
            filter: 'brightness(1.03)',
            opacity: '0.4',
          },
        },
        breathing: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        orbPulse: 'orbPulse 4s ease-in-out infinite',
        breathing: 'breathing 2s ease-in-out infinite',
      },
    },
  },
  plugins: [
    function ({ addUtilities }: any) {
      addUtilities({
        '.text-text1': {
          color: 'var(--color-text-1)',
        },
        '.text-text2': {
          color: 'var(--color-text-2)',
        },
        '.bg-surface-1': {
          backgroundColor: 'var(--color-surface-1)',
        },
        '.bg-surface-2': {
          backgroundColor: 'var(--color-surface-2)',
        },
        '.border-stroke': {
          borderColor: 'var(--color-stroke)',
        },
        '.text-accent': {
          color: 'var(--color-accent)',
        },
        '.bg-accent': {
          backgroundColor: 'var(--color-accent)',
        },
        '.shadow-elev1_dark': {
          boxShadow: 'var(--shadow-elev-1)',
        },
      });
    },
  ],
};

export default config;
