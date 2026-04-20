import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        arena: {
          bg: '#0a0a0f',
          surface: '#111118',
          border: '#1e1e2e',
          accent: '#7c3aed',
          'accent-light': '#a78bfa',
          gold: '#f59e0b',
          green: '#10b981',
          red: '#ef4444',
          blue: '#3b82f6',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'count-down': 'countDown linear forwards',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(124, 58, 237, 0)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(124, 58, 237, 0.4)' },
        },
        slideUp: {
          from: { transform: 'translateY(16px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
