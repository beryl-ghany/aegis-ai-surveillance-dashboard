
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        aegis: {
          bg: "#0B0F14",        // deep navy background
          card: "#121923",      // card surface
          primary: "#1E90FF",   // Dodger Blue (primary)
          contrast: "#FF6A00",  // Orange contrast accent
          mint: "#00D3A7",      // Teal for success/ok
          ring: "#3B82F6"       // focus ring-ish blue
        }
      },
      boxShadow: {
        glow: "0 0 0 2px rgba(30,144,255,0.22), 0 0 30px rgba(30,144,255,0.18)"
      }
    },
  },
  plugins: [],
}
