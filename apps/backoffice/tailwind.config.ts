// Tailwind del BackOffice: colores del branding de Schmidt (negro y camel).
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        sidebar: '#1A1A1A',
        'sidebar-hover': '#2A2A2A',
        accent: '#B3855C',
      },
      fontFamily: { display: ['var(--font-display)', 'Playfair Display', 'Georgia', 'serif'] },
    },
  },
  plugins: [],
};

export default config;
