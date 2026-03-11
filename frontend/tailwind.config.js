/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        medical: {
          primary: '#2563EB',     // Professional Blue
          secondary: '#64748B',   // Clinical Slate
          accent: '#0D9488',      // Medical Teal
          bg: '#F8FAFC',          // Soft Background
          surface: '#FFFFFF',     // Card Surface
          text: '#0F172A',        // Deep Text
          'bg-soft': '#F1F5F9',
          border: '#E2E8F0',
          soft: '#E0F2FE',        // Light Blue Wash
          'bg-medical': '#F8FAFC', // Added for bg-medical-bg
        },
        // Backwards compatibility
        bipsync: {
          bg: '#F8FAFC',
          'bg-soft': '#FFFFFF',
          green: '#2563EB',
          emerald: '#0D9488',
          teal: '#F1F5F9',
          gray: '#64748B',
        },
      },
      boxShadow: {
        'medical-soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'medical-card': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
        'glow-primary': '0 0 20px -5px rgba(37, 99, 235, 0.3)',
      },
      backgroundImage: {
        'medical-gradient': 'linear-gradient(135deg, #F8FAFC 0%, #E0F2FE 100%)',
        'hero-pattern': "url('https://www.transparenttextures.com/patterns/cubes.png')",
        'medical-bg': "url('/src/assets/medical-bg.jpg')", // Your custom medical background image
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};