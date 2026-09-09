/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Indian Government Disaster Management Theme (NIDM inspired)
        gov: {
          primary: '#006B4F',       // Primary Dark Green / deep forest green
          primaryHover: '#00523c',
          secondary: '#008060',     // Secondary Green
          secondaryHover: '#00664d',
          light: '#EAF5F0',         // Light Green
          alert: '#E63946',         // Red / Alert for emergency & high-risk
          alertHover: '#c92a37',
          text: '#1F2937',          // Dark text
          bg: '#F5F7F6',            // Light neutral / greenish background
          border: '#D9E2DE',        // Border Gray
          borderSubtle: '#E5EDE9',
        },
        // True-black dark mode system (strictly neutral zinc/pitch-black, NO blue/navy)
        dark: {
          bg: '#000000',
          surface: '#09090b',
          card: '#121212',
          elevated: '#18181b',
          hover: '#222226',
          border: '#27272a',
          borderSubtle: '#18181b',
          text: '#f4f4f5',
          muted: '#a1a1aa',
          dim: '#71717a',
        },
        // Crisp light mode system
        light: {
          bg: '#F5F7F6',
          surface: '#ffffff',
          card: '#ffffff',
          elevated: '#EAF5F0',
          hover: '#e2e8f0',
          border: '#D9E2DE',
          borderSubtle: '#E5EDE9',
          text: '#1F2937',
          muted: '#4B5563',
          dim: '#6B7280',
        },
        // Risk & status indicators
        severity: {
          critical: '#E63946',
          high: '#ea580c',
          medium: '#eab308',
          low: '#008060',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-red': '0 0 20px -3px rgba(220, 38, 38, 0.4)',
        'glow-amber': '0 0 20px -3px rgba(234, 88, 12, 0.4)',
        'glow-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.4)',
        'dark-card': '0 4px 20px 0 rgba(0, 0, 0, 0.75)',
      },
    },
  },
  plugins: [],
};
