/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",

  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {
      fontFamily: {
        comfortaa: ['Comfortaa', 'sans-serif']
      },
      colors: {
        'primary': '#FFC409',
        'secondary': '#130900',
        'accent': '#FFFDF1',
        'accent-light': '#FF571A',
      },
    },
  },

  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}

