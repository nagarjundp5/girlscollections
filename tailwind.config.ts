import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/context/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background, #FAF6EE)",
        foreground: "var(--foreground, #1A1A2E)",
        navy: {
          DEFAULT: "var(--navy, #1A1E3A)",
          deep: "var(--navy-deep, #14183A)",
          dark: "#0D0E1A",
          light: "#252B4E",
        },
        inkNavy: {
          DEFAULT: "var(--navy, #1A1E3A)",
          dark: "var(--navy-deep, #14183A)",
          light: "#252B4E",
        },
        nearBlack: "#0D0E1A",
        ivory: {
          DEFAULT: "var(--ivory, #FAF6EE)",
          card: "var(--ivory, #FAF6EE)",
          warm: "var(--ivory-warm, #F5F0E6)",
          muted: "#F2E9D8",
          sand: "#E8DCC8",
        },
        sand: {
          DEFAULT: "var(--sand, #E8DCC8)",
          dark: "#D6C4A9",
          light: "#FAF6EE",
        },
        gold: {
          DEFAULT: "var(--gold, #B8924A)",
          light: "var(--gold-light, #D4B878)",
          dark: "#8B6A2E",
        },
        zariGold: {
          DEFAULT: "var(--gold, #B8924A)",
          light: "var(--gold-light, #D4B878)",
          dark: "#8B6A2E",
          gradientStart: "#B8924A",
          gradientEnd: "#8B6A2E",
        },
        oxblood: {
          DEFAULT: "#7A1F2B",
          dark: "#57141E",
          light: "#9E2C3B",
        },
        blush: {
          DEFAULT: "var(--blush, #F3DDE0)",
          light: "#FAF6EE",
          dark: "#B8924A",
        },
        charcoal: {
          DEFAULT: "#1A1A2E",
          light: "#282C52",
          muted: "#6B6B7B",
        },
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Cormorant Garamond", "Georgia", "serif"],
        display: ["var(--font-cormorant)", "Cormorant Garamond", "Georgia", "serif"],
        cormorant: ["var(--font-cormorant)", "Cormorant Garamond", "Georgia", "serif"],
        fraunces: ["var(--font-cormorant)", "Cormorant Garamond", "Georgia", "serif"],
        sans: ["var(--font-jost)", "Jost", "system-ui", "sans-serif"],
        body: ["var(--font-jost)", "Jost", "system-ui", "sans-serif"],
        jost: ["var(--font-jost)", "Jost", "system-ui", "sans-serif"],
        script: ["var(--font-cormorant)", "Georgia", "serif"],
      },
      transitionTimingFunction: {
        luxury: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        bounceSoft: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      letterSpacing: {
        eyebrow: "0.25em",
        wideLuxury: "0.15em",
      },
      boxShadow: {
        luxury: "0 10px 30px -10px rgba(28, 37, 68, 0.08)",
        floating: "0 20px 40px -15px rgba(28, 37, 68, 0.15)",
        card: "0 4px 20px rgba(0, 0, 0, 0.03)",
        roseGold: "0 0 20px rgba(201, 162, 120, 0.25)",
      },
      borderRadius: {
        scallop: "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
