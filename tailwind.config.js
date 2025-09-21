/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        colors: {
            'primary': '#F9FAFB',      // Light gray background
            'secondary': '#FFFFFF',     // White for cards, sidebar
            'accent': '#6366F1',        // Indigo accent
            'light': '#111827',         // Dark text for headings
            'dark-text': '#6B7280',    // Muted dark text for paragraphs
            'border-color': '#E5E7EB',  // Border color for consistency
            'hover-bg': '#F3F4F6',      // Hover background for consistency
        },
        fontFamily: {
            sans: ['Inter', 'sans-serif'],
        },
        animation: {
            'fade-in': 'fadeIn 0.5s ease-out forwards',
            'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        },
        keyframes: {
            fadeIn: {
                '0%': { opacity: 0, transform: 'translateY(10px)' },
                '100%': { opacity: 1, transform: 'translateY(0)' },
            }
        }
    }
  },
  plugins: [],
}