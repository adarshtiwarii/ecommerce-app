// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'forest-dark': '#0A0F0D',
        'forest-deep': '#0D1A12',
        'forest-surface': '#111B16',
        'neon-green': '#00FF88',
        'neon-bright': '#39FF14',
      },
      fontFamily: {
        'ultra-light': ['Poppins', 'Inter', 'system-ui'],
      },
      fontSize: {
        'monumental': '5rem',
        'monumental-sm': '3rem',
      },
      animation: {
        'glow-pulse': 'glowPulse 2s infinite',
        'fade-up': 'fadeUp 0.5s ease-out',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { textShadow: '0 0 5px #00FF88, 0 0 10px #00FF88' },
          '50%': { textShadow: '0 0 20px #00FF88, 0 0 30px #39FF14' },
        },
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'cinematic-gradient': 'radial-gradient(circle at 10% 20%, rgba(0,255,136,0.15), rgba(10,15,13,0.9))',
      },
    },
  },
  plugins: [],
}