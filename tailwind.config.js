/** @type {import('tailwindcss').Config} */
export default {
  // CRITICAL: This content array must list all file types where you use Tailwind classes.
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
