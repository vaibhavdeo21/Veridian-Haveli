/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        haveli: {
          bg: '#F4EFE7',        // Warm marble cream
          section: '#FBF8F2',   // Slightly lighter section background
          card: '#FFFFFF',      // Pure white for cards
          deep: '#0F2A23',      // Deep Green (Navbar/Footer)
          primary: '#1E5F4E',   // Emerald
          primaryHover: '#154639', 
          accent: '#C2A14D',    // Antique Gold
          accentHover: '#D8B96B', // Soft Gold Hover
          heading: '#0F2A23',   // Headings text
          body: '#2E2E2E',      // Body text
          muted: '#7A7A7A',     // Muted text
          border: '#E7E1D6',    // Soft border color
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], 
        display: ['Playfair Display', 'serif'], // Luxury serif for headings
      }
    },
  },
  plugins: [],
}