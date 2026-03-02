import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0F0F0F',
        card: '#1A1A1A',
        border: '#2A2A2A',
        accent: '#F7931A',
        'accent-hover': '#E8820A',
        text: '#FFFFFF',
        muted: '#888888',
        success: '#22C55E',
        danger: '#EF4444'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
} satisfies Config;
