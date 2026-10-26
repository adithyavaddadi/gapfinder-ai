module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        lav: {
          50: "#F8F5FF",
          100: "#EEE8FD",
          200: "#E2D9FA",
          300: "#CDBDF5",
          400: "#B8A3EF",
          500: "#A58EE6",
          600: "#8365D6",
          700: "#5B45A8",
          800: "#3D2B78",
          900: "#271B52",
          950: "#181035",
        },
        chart: "#C3E92B",
        tomato: "#FF6347",
        ink: "#241F35",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
};
