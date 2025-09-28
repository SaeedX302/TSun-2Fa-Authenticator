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
        'primary': '#F2EBE3',
        'secondary': '#D5C4B8',
        'accent': '#A98B75',
        'highlight': '#8C6D5B',
        // Claymate Text Colors
        'text-main': '#5C3D2E', // A dark, rich brown
        'text-light': '#7B5E50', // A softer, mid-tone brown
        'text-dark': '#402C20',   // A very dark, almost black-brown
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