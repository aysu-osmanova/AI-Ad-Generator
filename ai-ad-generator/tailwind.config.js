/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        mint: {
          50: '#f1fbf7',
          100: '#dff7ef',
          200: '#c4efe2',
          300: '#AEE2D3',
          400: '#69cfb8',
          500: '#37b99e',
          600: '#23977f'
        }
      },
      boxShadow: {
        mint: '0 18px 45px rgba(110, 213, 190, 0.35)',
        feather: '0 18px 60px rgba(15, 23, 42, 0.07)'
      }
    }
  },
  plugins: []
};
