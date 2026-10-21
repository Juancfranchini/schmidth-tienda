// Tailwind CSS configuration with custom colors for the BackOffice
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        sidebar: '#0f172a',
        'sidebar-hover': '#1e293b',
        accent: '#C8FF00',
      },
    },
  },
  plugins: [],
};

export default config;
