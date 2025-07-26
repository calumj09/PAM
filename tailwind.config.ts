import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'pam-red': '#7D0820',
        'pam-pink': '#F9B1BC', 
        'pam-cream': '#FFFBF8',
      },
      fontFamily: {
        'heading': ['The Seasons', 'serif'],
        'sans': ['Montserrat', 'sans-serif'],
      },
      maxWidth: {
        'pam': '430px', // Mobile-first container
      }
    },
  },
  plugins: [],
} satisfies Config;