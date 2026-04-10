/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['elza', 'sans-serif'],
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(calc(-100% - 1.5rem))' },
        },
        marqueeReverse: {
          from: { transform: 'translateX(calc(-100% - 1.5rem))' },
          to: { transform: 'translateX(0)' },
        },
        marqueeVertical: {
          from: { transform: 'translateY(0)' },
          to: { transform: 'translateY(calc(-50% - 0.5rem))' },
        },
        marqueeVerticalReverse: {
          from: { transform: 'translateY(calc(-50% - 0.5rem))' },
          to: { transform: 'translateY(0)' },
        },
      },
      animation: {
        marquee: 'marquee 60s linear infinite',
        marqueeReverse: 'marqueeReverse 60s linear infinite',
        marqueeVertical: 'marqueeVertical 80s linear infinite',
        marqueeVerticalReverse: 'marqueeVerticalReverse 80s linear infinite',
      },
    },
  },
  plugins: [],
}
