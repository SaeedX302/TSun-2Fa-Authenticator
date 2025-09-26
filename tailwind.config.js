// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Fixes the Tailwind CSS missing content warning
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom deep dark scheme for a professional look
        'tsun-dark': '#0f172a', // Slate-900 se thora gehra
        'tsun-bg': '#070a13', // Ultra dark background
        'primary': '#154D71',
        'secondary': '#1C6EA4',
        'accent': '#33A1E0',
        'highlight': '#FFF9AF'
      },
      boxShadow: {
        '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
        'glass-inner': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.1)',
      },
      // Agar aapko fonts import karne hon
      fontFamily: {
        // sans: ['Inter', 'sans-serif'],
      },
      // Animation settings
      transitionTimingFunction: {
        'silk': 'cubic-bezier(0.4, 0, 0.2, 1)', // smoother than silk
      },
    },
  },
  plugins: [],
}