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
          bg: "#000000",
          bgSecondary: "#121214",
          surface: "rgba(24, 24, 27, 0.75)",
          surfaceSolid: "#18181a",
          surfaceHover: "rgba(38, 38, 42, 0.85)",
          accent: "#B6F36B",
          accentWhite: "#ffffff",
          accentHover: "#d4ff88",
          secondaryAccent: "#c4c2c3",
          pillDark: "#28282a",
          pillDarkHover: "#323234",
          text: "#ffffff",
          muted: "#8e8e8e",
          navText: "#2e2e2e",
          warning: "#E6B85C",
          critical: "#E87979",
          border: "rgba(255, 255, 255, 0.12)",
          borderLight: "rgba(255, 255, 255, 0.24)",
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['Space Grotesk', 'sans-serif'],
        display: ['BubbledotICG-FinePos', 'Geist Pixel Circle', 'monospace'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'nav': '0 4px 14px rgba(0, 0, 0, 0.16)',
        'glow': '0 0 0 1px rgba(255,255,255,0.15), 0 0 22px rgba(255,255,255,0.32), 0 0 44px rgba(255,255,255,0.12)',
        'glow-strong': '0 0 0 1px rgba(255,255,255,0.25), 0 0 28px rgba(255,255,255,0.45), 0 0 54px rgba(255,255,255,0.2)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
