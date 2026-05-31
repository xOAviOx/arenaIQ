import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        arena: {
          // surfaces
          bg: '#07080c',
          ink: '#07080c',
          surface: '#0f111a',
          panel: '#0f111a',
          'panel-2': '#161a26',
          raised: '#1b2030',
          border: '#222739',
          line: '#222739',
          'line-2': '#2d3346',
          // signature
          accent: '#c8ff3d',
          'accent-light': '#dcff7a',
          volt: '#c8ff3d',
          'volt-dim': '#9bcc1f',
          cyan: '#39e0ff',
          gold: '#ffce4d',
          // semantic
          green: '#2fe6a0',
          red: '#ff5468',
          blue: '#5b8cff',
          // text
          text: '#e9ebf3',
          dim: '#979db2',
          faint: '#5c6378',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Syne', 'sans-serif'],
        sans: ['var(--font-sans)', 'Hanken Grotesk', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        volt: '0 0 0 1px rgba(200,255,61,0.25), 0 8px 40px -8px rgba(200,255,61,0.35)',
        'volt-sm': '0 0 24px -6px rgba(200,255,61,0.45)',
        panel: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 24px 60px -32px rgba(0,0,0,0.9)',
        glow: '0 0 60px -12px rgba(57,224,255,0.35)',
      },
      backgroundImage: {
        'volt-grad': 'linear-gradient(120deg, #c8ff3d 0%, #7af0c0 55%, #39e0ff 100%)',
        'gold-grad': 'linear-gradient(120deg, #ffe08a 0%, #ffce4d 50%, #ff9e3d 100%)',
        'sheen': 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.14) 45%, transparent 60%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out both',
        rise: 'rise 0.7s cubic-bezier(0.16,1,0.3,1) both',
        'slide-up': 'rise 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'pop-in': 'popIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both',
        'pulse-glow': 'pulseGlow 2.4s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        'grid-pan': 'gridPan 22s linear infinite',
        shimmer: 'shimmer 2.6s linear infinite',
        sheen: 'sheen 3.5s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'ping-slow': 'pingSlow 2.2s cubic-bezier(0,0,0.2,1) infinite',
        'count-down': 'countDown linear forwards',
        blink: 'blink 1.1s steps(2,start) infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        rise: {
          from: { transform: 'translateY(22px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        popIn: {
          '0%': { transform: 'scale(0.85) translateY(10px)', opacity: '0' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(200,255,61,0)', opacity: '0.9' },
          '50%': { boxShadow: '0 0 28px 2px rgba(200,255,61,0.45)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        gridPan: {
          from: { backgroundPosition: '0 0' },
          to: { backgroundPosition: '40px 40px' },
        },
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        },
        sheen: {
          '0%': { transform: 'translateX(-120%)' },
          '60%, 100%': { transform: 'translateX(120%)' },
        },
        pingSlow: {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '75%, 100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        countDown: { from: { strokeDashoffset: '0' } },
        blink: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.2' } },
      },
    },
  },
  plugins: [],
};

export default config;
