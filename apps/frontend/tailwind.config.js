/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5',
        surface: '#0f172a',
        accent: '#22d3ee',
      },
    },
  },
  plugins: [],
};
