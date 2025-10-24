// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f3eeff",
          100: "#e8ddff",
          200: "#d4bdff",
          300: "#bb97ff",
          400: "#a271fb",
          500: "#7c3aed", // primary
          600: "#6d28d9",
          700: "#5b21b6",
        },
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(0,0,0,0.04)",
      },
    },
    container: {
      center: true,
      padding: { DEFAULT: "0.75rem", lg: "1.5rem" },
    },
  },
  plugins: [],
};
