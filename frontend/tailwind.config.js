/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cinematic dark theme colors
        'cinematic-dark': '#0A0F1A',
        'cinematic-card': '#111827',
        'cinematic-border': '#1F2937',
        'cinematic-accent': '#3B82F6',
        'cinematic-glow': '#00A3FF',
        'cinematic-text': '#F3F4F6',
        'cinematic-text-muted': '#9CA3AF',
      },
      fontFamily: {
        'display': ['Poppins', 'system-ui'],
        'sans': ['Inter', 'Poppins', 'system-ui'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'glow': '0 0 15px rgba(59, 130, 246, 0.5)',
        'glow-lg': '0 0 30px rgba(59, 130, 246, 0.6)',
      },
    },
  },
  plugins: [],
}