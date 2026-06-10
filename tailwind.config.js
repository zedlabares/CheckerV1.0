/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070E17',
          900: '#0F1C2E',
          800: '#162538',
          700: '#1A2F4A',
          600: '#1E3A5F',
          500: '#2A4E7A',
        },
        pass: '#00C896',
        fail: '#E53E3E',
        warn: '#F6AD55',
        slate: {
          muted: '#8899AA',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
    },
  },
  plugins: [],
}
