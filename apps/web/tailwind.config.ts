import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-playfair)', 'Lora', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        surface: {
          DEFAULT: 'var(--surface)',
          muted: 'var(--surface-muted)',
        },
        border: {
          DEFAULT: 'var(--border)',
          hairline: 'var(--border-hairline)',
          subtle: 'var(--border-subtle)',
        },
        muted: 'var(--muted)',
      },
      letterSpacing: {
        'tightest': '-0.05em',
        'tighter': '-0.03em',
        'tight': '-0.015em',
        'normal': '0',
        'wide': '0.05em',
        'wider': '0.1em',
        'widest': '0.18em',
        'ultra': '0.25em',
      },
    },
  },
  plugins: [],
};

export default config;
