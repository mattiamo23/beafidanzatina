/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        bea: {
          50: '#fff8e6',
          100: '#fff2cc',
          200: '#fde6a6',
          300: '#f9d66f',
          400: '#f7c248',
          500: '#f0b400'
        }
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui']
      }
    }
  },
  plugins: []
};