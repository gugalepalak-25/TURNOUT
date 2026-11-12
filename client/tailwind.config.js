/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cr: {
          bg: "#101713",
          bgSecondary: "#17221C",
          surface: "#1C2922",
          surfaceHover: "#23332B",
          accent: "#B6F36B",
          accentHover: "#C6F785",
          secondaryAccent: "#66CDAA",
          text: "#E8F0E8",
          muted: "#89988C",
          warning: "#E6B85C",
          critical: "#E87979",
          border: "#304238",
          borderLight: "#3E5347",
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['Space Grotesk', 'sans-serif'],
        display: ['BubbledotICG-FinePos', 'Geist Pixel Circle', 'monospace'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}

