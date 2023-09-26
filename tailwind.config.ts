import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        "zoom-in-out": "zoom 0.5s ease-in-out",
        "drop-zoom-in-out": "drop 1s ease-in-out"
      },
      keyframes: {
        zoom: {
          "0%": {
            transform: 'scale(2)'
          },
          "100%": {
            transform: 'scale(1)'
          }
        },
        drop: {
          "0%": {
            transform: 'scale(0.5) translateY(-200%) '
          },
          "100%": {
            transform: 'scale(1) translateY(0) '
          }
        }
      }
    },
  },
  plugins: [],
} satisfies Config;
