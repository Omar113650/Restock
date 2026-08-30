import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050505", // Deeper black
        surface: "#0a0f1d", // Deep navy black
        surfaceHighlight: "#111827", // Slightly lighter navy
        primary: {
          DEFAULT: "#3b82f6",
          dark: "#1e3a8a", // Very dark blue
          light: "#60a5fa",
          glow: "rgba(59, 130, 246, 0.5)",
        },
        secondary: {
          DEFAULT: "#8b5cf6", // Purple accent
          dark: "#5b21b6",
          light: "#a78bfa",
        },
        text: {
          DEFAULT: "#f1f5f9",
          muted: "#94a3b8",
        }
      }
    },
  },
  plugins: [],
};
export default config;
