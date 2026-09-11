
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        custom: {
          dark: '#57564F',
          muted: '#7A7A73',
          soft: '#DDDAD0',
          accent: '#F8F3CE',
        },
        brand: {
          50: '#fcfbfa',
          100: '#F8F3CE',
          500: '#57564F',
          600: '#57564F',
          700: '#474640',
          900: '#2b2a26',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
