/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Configure content paths
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2da58c',      // Brand primary color
        background: '#fefffe',  // Brand background/white
        textSecondary: '#595e65', // Brand secondary text color
        // Add other shades if needed, e.g., a lighter gray
        grayLight: '#e5e7eb',
      },
      fontFamily: {
        primary: ['Lato', 'sans-serif'],      // Brand primary font
        secondary: ['Montserrat', 'sans-serif'], // Brand secondary font
      },
      borderRadius: {
        brand: '10px', // Custom brand border radius
      },
      fontSize: {
        // You can add specific sizes if needed, but Tailwind covers 16-64px well
        // Example: 'jumbo': '4rem', // 64px
      },
    },
    // Optionally set the default font for the body
    fontFamily: {
      sans: ['Lato', 'sans-serif'],
      serif: ['Georgia', 'serif'], // Keep a serif option
      mono: ['monospace'],
    },
  },
  plugins: [],
}