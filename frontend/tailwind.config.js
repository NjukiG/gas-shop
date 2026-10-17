/** @type {import('tailwindcss').Config} */

// ScentCity design tokens — the single source of truth for brand colors.
// Reuse these everywhere via Tailwind classes (e.g. bg-ink, text-platinum)
// or the daisyUI semantic colors (primary, base-100, etc.).
const brand = {
  ink: "#0C0D10", // page background (near-black)
  onyx: "#15171C", // raised surfaces / cards
  graphite: "#23262D", // borders / subtle surfaces
  steel: "#8A9199", // muted metallic
  platinum: "#B8BCC4", // primary accent (steel/platinum)
  chrome: "#D7DBE0", // bright accent / hover
  fog: "#E8EAED", // primary text
  ash: "#9AA0A8", // secondary / muted text
};

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: brand.ink,
        onyx: brand.onyx,
        graphite: brand.graphite,
        steel: brand.steel,
        platinum: brand.platinum,
        chrome: brand.chrome,
        fog: brand.fog,
        ash: brand.ash,
      },
      fontFamily: {
        // Display / headings — modern, edgy grotesque.
        display: ['"Space Grotesk"', "ui-sans-serif", "system-ui", "sans-serif"],
        // Body — clean, neutral, highly legible.
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
    },
  },
  corePlugins: {
    aspectRatio: false,
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("daisyui"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio"),
  ],
  daisyui: {
    themes: [
      {
        scentcity: {
          primary: brand.platinum, // accent / CTAs
          "primary-content": brand.ink,
          secondary: brand.steel,
          "secondary-content": brand.ink,
          accent: brand.chrome,
          "accent-content": brand.ink,
          neutral: brand.onyx,
          "neutral-content": brand.fog,
          "base-100": brand.ink, // page background
          "base-200": brand.onyx, // cards / raised
          "base-300": brand.graphite, // borders
          "base-content": brand.fog, // default text
          info: "#7CA5C9",
          success: "#6FB58A",
          warning: "#D6B06A",
          error: "#C97A7A",
          "--rounded-box": "0.75rem",
          "--rounded-btn": "0.4rem",
        },
      },
    ],
    darkTheme: "scentcity",
  },
};
