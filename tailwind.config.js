/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cus1: "#FFEDD5",
        cus2: "#E5D0AC",
        "cus2-hover": "#e0c391",
        cus3: "#e87878",
        purple: "#6C63FF",
      },
    },
  },
  plugins: [],
};
