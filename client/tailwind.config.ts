import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"] ,
  theme: {
    extend: {
      colors: {
        base: "#FEFEFE",
        ink: "#0B0B0B",
        muted: "#4B4B4B",
        line: "#E6E6E6",
        accent: "#111111"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(236,236,68,0.2), 0 12px 50px rgba(0,0,0,0.45)"
      }
    }
  },
  plugins: []
} satisfies Config;
