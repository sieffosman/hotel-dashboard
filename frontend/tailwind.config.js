// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F9FAFB",
        surface:    "#242424",
        dark:       "#111827",
        muted:      "#6B7280",
        primary:    "#EF5350",
      },
      fontFamily: {
        heading: ["Karla","sans-serif"],
        body:    ["Merriweather","serif"],
      },
    },
  },
  plugins: [],
};
