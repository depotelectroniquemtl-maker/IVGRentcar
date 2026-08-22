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
        // Repris de l'identité visuelle I.V.J Polanco (rouge + noir/gris) — direction
        // visuelle fixée dès le premier écran, à ne pas redéfinir écran par écran.
        brand: {
          DEFAULT: "#D81E2C",
          dark: "#A6141F",
          light: "#F8D7DA",
        },
        ink: {
          DEFAULT: "#111111",
          soft: "#3A3A3A",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
