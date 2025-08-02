import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // PAM Brand Colors - New Design System
        'pam-primary': '#B54548',
        'pam-background': '#F8F8F8',
        'pam-white': '#FFFFFF',
        'pam-success': '#4CAF50',
        'pam-gray': {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#E0E0E0',
          400: '#BDBDBD',
          500: '#9E9E9E',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },
        
        // Legacy colors for backwards compatibility
        'pam-burgundy': '#B54548', // Updated to new primary
        'pam-red': '#B54548', // Updated to new primary
        'pam-pink': '#F9B1BC', 
        'pam-cream': '#FFFBF8',
        'pam-gray-border': '#E0E0E0',
        'pam-text-gray': '#666666',
        
        // Design.md Semantic Colors
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: 'hsl(var(--card))',
        'card-foreground': 'hsl(var(--card-foreground))',
        popover: 'hsl(var(--popover))',
        'popover-foreground': 'hsl(var(--popover-foreground))',
        primary: {
          DEFAULT: '#B54548', // New PAM primary
          foreground: '#FFFFFF', // White
        },
        secondary: {
          DEFAULT: '#F9B1BC', // PAM pink
          foreground: '#B54548', // New PAM primary
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      fontFamily: {
        // New Design System Typography
        'sans': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'system-ui', 'sans-serif'],
        'display': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'system-ui', 'sans-serif'],
        'body': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'system-ui', 'sans-serif'],
        // Legacy compatibility
        'heading': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Design System Scale 12px - 32px
        'xs': ['12px', { lineHeight: '16px', letterSpacing: '0.025em' }],
        'sm': ['14px', { lineHeight: '20px', letterSpacing: '0.025em' }],
        'base': ['16px', { lineHeight: '24px', letterSpacing: '0em' }],
        'lg': ['18px', { lineHeight: '28px', letterSpacing: '0em' }],
        'xl': ['20px', { lineHeight: '28px', letterSpacing: '0em' }],
        '2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.025em' }],
        '3xl': ['28px', { lineHeight: '36px', letterSpacing: '-0.025em' }],
        '4xl': ['32px', { lineHeight: '40px', letterSpacing: '-0.025em' }],
        // PAM Logo specific
        'pam-logo': ['32px', { lineHeight: '40px', letterSpacing: '0.1em' }],
      },
      // Design.md Spacing Scale
      spacing: {
        'xs': '0.5rem',   // 8px
        'sm': '1rem',     // 16px
        'md': '1.5rem',   // 24px
        'lg': '2rem',     // 32px
        'xl': '3rem',     // 48px
        '2xl': '4rem',    // 64px
      },
      maxWidth: {
        'pam': '430px', // Mobile-first container
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;