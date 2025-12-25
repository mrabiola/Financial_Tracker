/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./public/index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#4F85FF',
          50: '#EEF4FF',
          100: '#DCE8FF',
          200: '#B9D1FF',
          300: '#8BB4FF',
          400: '#6B95FF',
          500: '#4F85FF',
          600: '#3D6FE8',
          700: '#2B5BD1',
          800: '#1E47B0',
          900: '#153580',
        },
      },
      boxShadow: {
        'glow': '0 0 60px -15px rgba(79, 133, 255, 0.4)',
        'glow-lg': '0 0 80px -20px rgba(79, 133, 255, 0.5)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 20px 40px -15px rgba(0, 0, 0, 0.1)',
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(79, 133, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(79, 133, 255, 0.03) 1px, transparent 1px)',
        'mesh-gradient': 'radial-gradient(at 40% 20%, rgba(79, 133, 255, 0.08) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(79, 133, 255, 0.05) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(79, 133, 255, 0.05) 0px, transparent 50%)',
      },
      backgroundSize: {
        'grid': '60px 60px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
