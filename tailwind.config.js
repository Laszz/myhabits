/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#10B981",
          dark: "#059669",
          light: "#D1FAE5",
        },
        neutral: {
          background: { DEFAULT: "#FFFFFF", dark: "#000000" },
          surface: { DEFAULT: "#FFFFFF", dark: "#111111" },
          "surface-soft": { DEFAULT: "#F3F4F6", dark: "#1A1A1A" },
          border: { DEFAULT: "#E5E7EB", dark: "#262626" },
          text: { DEFAULT: "#000000", dark: "#FFFFFF" },
          "secondary-text": { DEFAULT: "#6B7280", dark: "#9CA3AF" },
        },
        accent: {
          success: "#22C55E",
          warning: "#F59E0B",
          danger: "#EF4444",
          blue: "#3B82F6",
          orange: "#F97316",
        },
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
};
