import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0A0A0A',
          darker: '#050505',
          purple: '#865DFF',
          pink: '#E384FF',
          light: '#FFA3FD',
          accent: '#22c55e',
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-in-out',
        'fade-out': 'fade-out 0.5s ease-in-out',
        'slide-in': 'slide-in 0.5s ease-in-out',
        'slide-out': 'slide-out 0.5s ease-in-out',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-out': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'glow': {
          '0%': { 
            'box-shadow': '0 0 5px rgb(134 93 255 / 0.2), 0 0 20px rgb(134 93 255 / 0.2), 0 0 30px rgb(134 93 255 / 0.2)'
          },
          '100%': {
            'box-shadow': '0 0 10px rgb(134 93 255 / 0.3), 0 0 40px rgb(134 93 255 / 0.3), 0 0 50px rgb(134 93 255 / 0.3)'
          }
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'dot-pattern': 'radial-gradient(circle, #222 1px, transparent 1px)',
        'footer-gradient': 'linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.5) 15%, rgba(0, 0, 0, 0.75) 30%, #000 60%)',
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
