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
        'primary': '#FFEDDB',
        'secondary': '#EDCDBB',
        'accent': '#E3B7A0',
        'highlight': '#BF9270',
        // Claymate Text Colors
        'text-main': '#8D6E63', // A deep, earthy brown
        'text-light': '#A1887F', // A softer, lighter brown
        'text-dark': '#5D4037',   // A darker, more grounded brown
      },
      boxShadow: {
        '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
        'glass-inner': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.1)',
      },
      // Animation settings
      transitionTimingFunction: {
        'silk': 'cubic-bezier(0.4, 0, 0.2, 1)', // smoother than silk
      },
    },
  },
  plugins: [require('tailwind-scrollbar')],
}