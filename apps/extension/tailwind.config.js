/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        muted: '#939393',
        twitch: {
          black: '#18181B',
          grey: '#636363',
          light: '#EEE2FF',
          dark: '#451093',
          DEFAULT: '#9147ff',
          background: '#2C2C31',
        },
      },
    },
  },
  plugins: [require('tailwindcss-font-inter')]
}