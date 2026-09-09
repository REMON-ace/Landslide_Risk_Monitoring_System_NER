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
        // AppDashboard Landslide Risk Theme System
        app: {
          primary: '#006B4F',
          primaryHover: '#00523C',
          primaryLight: '#EAF5F0',
          canvas: '#F5F7F6',
          surface: '#FFFFFF',
          border: '#D9E2DE',
          borderSubtle: '#E5EDE9',
          text: '#1F2937',
          muted: '#4B5563',
          dim: '#6B7280',
          darkCanvas: '#000000',
          darkSurface: '#0D0E10',
          darkElevated: '#141418',
          darkBorder: '#27272A',
          darkBorderSubtle: '#18181B',
          darkText: '#F4F4F5',
          darkMuted: '#A1A1AA',
        },
        // Indian Government Disaster Management Theme (NIDM inspired)
        gov: {
          primary: '#006B4F',       // Primary Dark Green / deep forest green
          primaryHover: '#00523C',
          secondary: '#008060',     // Secondary Green
          secondaryHover: '#00664D',
          light: '#EAF5F0',         // Light Green
          alert: '#E63946',         // Red / Alert for emergency & high-risk
          alertHover: '#C92A37',
          text: '#1F2937',          // Dark text
          bg: '#F5F7F6',            // Light neutral / greenish background
          border: '#D9E2DE',        // Border Gray
          borderSubtle: '#E5EDE9',
        },
        // True-black dark mode system (strictly neutral zinc/pitch-black, NO blue/navy)
        dark: {
          bg: '#000000',
          surface: '#0D0E10',
          card: '#121215',
          elevated: '#18181B',
          hover: '#202025',
          border: '#27272A',
          borderSubtle: '#18181B',
          text: '#F4F4F5',
          muted: '#A1A1AA',
          dim: '#71717A',
        },
        // Crisp light mode system
        light: {
          bg: '#F5F7F6',
          surface: '#FFFFFF',
          card: '#FFFFFF',
          elevated: '#EAF5F0',
          hover: '#E2E8F0',
          border: '#D9E2DE',
          borderSubtle: '#E5EDE9',
          text: '#1F2937',
          muted: '#4B5563',
          dim: '#6B7280',
        },
        // Risk & status indicators (semantic compliance)
        severity: {
          critical: '#E63946',
          high: '#EA580C',
          medium: '#D97706',
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
