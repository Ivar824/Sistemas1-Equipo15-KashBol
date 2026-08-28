/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        taller: {
          bg: '#121212',
          surface: '#181818',
          card: '#222222',
          border: '#333333',
          borderLight: '#444444',
          accent: '#3b82f6',
          accentHover: '#2563eb',
          textMain: '#f3f4f6',
          textMuted: '#9ca3af',
          success: '#22c55e',
          danger: '#ef4444',
        }
      }
    },
  },
  plugins: [],
}
