import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#13161F",
        surface: "#1C1F2A",
        accent: "#2783FF",
        accentSoft: "#1C3F73"
      },
      boxShadow: {
        glow: "0 0 32px rgba(39, 131, 255, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
