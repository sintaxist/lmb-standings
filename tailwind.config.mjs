/** @type {import('tailwindcss').Config} */

// Tokens extraídos de las variables del archivo de Figma
// (Black, Red, Gray, White, Dark Blue, Gray Light, Border Color, Green, Green Light).
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1c1c1e", // Black — texto principal / superficies oscuras
        brand: {
          red: "#ea0b2a", // Red — acento LMB
          navy: "#002b49", // Dark Blue — CTAs / cabeceras de tabla
        },
        surface: {
          DEFAULT: "#ffffff",
          muted: "#f9f9f9", // Gray Light — cajas de stats
          page: "#f2f2f7", // fondo de página
        },
        line: "#e5e7eb", // Border Color
        // Gray — texto secundario. Oscurecido respecto al original (#8e8e93)
        // para cumplir contraste AA (≥4.5:1) sobre fondos claros.
        muted: "#6b6b71",
        positive: {
          DEFAULT: "#15803d", // Green — rachas/diferenciales positivos
          soft: "#f0fdf4", // Green Light
        },
        negative: {
          DEFAULT: "#b91c1c",
          soft: "#fff1f2",
        },
      },
      fontFamily: {
        // Oswald: condensada atlética para títulos y cifras (look del Figma).
        display: ["Oswald", "Arial Narrow", "system-ui", "sans-serif"],
        // Inter: cuerpo y etiquetas.
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      maxWidth: {
        shell: "1200px",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "rise": "rise 0.5s ease-out both",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        rise: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
