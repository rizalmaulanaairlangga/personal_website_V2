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
        background: "#0A0404",
        surface: "#111010",
        border: "rgba(255,255,255,0.08)",
        "border-strong": "rgba(255,255,255,0.14)",
        primary: "#7AB8E8",
        "primary-hover": "#5A9FD4",
        text: "#F0F3FF",
        "text-muted": "rgba(240,243,255,0.7)",
        "text-dim": "rgba(240,243,255,0.5)",
        danger: "#FF6B6B",
        success: "#4ADE80",
        warning: "#FBBF24",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        serif: ["var(--font-serif)", "serif"],
        hand: ["var(--font-hand)", "cursive"],
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
      },
      borderRadius: {
        "4xl": "1.5rem",
      },
      boxShadow: {
        "card": "0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
        "card-hover": "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
        "modal": "0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
      },
      transitionDuration: {
        "400": "400ms",
      },
      transitionTimingFunction: {
        "ease-out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "ease-spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
};
export default config;