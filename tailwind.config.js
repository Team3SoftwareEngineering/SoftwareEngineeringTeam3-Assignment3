/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        'bg-elevated': 'var(--color-bg-elevated)',
        surface: 'var(--color-surface)',
        'surface-muted': 'var(--color-surface-muted)',
        'surface-strong': 'var(--color-surface-strong)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'accent-gold': 'var(--color-accent-gold)',
        'accent-gold-soft': 'var(--color-accent-gold-soft)',
        'accent-navy': 'var(--color-accent-navy)',
        'accent-navy-soft': 'var(--color-accent-navy-soft)',
        focus: 'var(--color-focus)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
      },
      fontFamily: {
        heading: ['Sora', '"Segoe UI"', 'sans-serif'],
        body: ['"Source Sans 3"', '"Segoe UI"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      borderRadius: {
        control: '10px',
        card: '14px',
        panel: '20px',
      },
      boxShadow: {
        panelSm: '0 2px 10px rgba(13, 30, 56, 0.07)',
        panelMd: '0 10px 28px rgba(13, 30, 56, 0.14)',
        panelLg: '0 22px 48px rgba(13, 30, 56, 0.24)',
        softInset: 'inset 0 1px 0 rgba(255, 255, 255, 0.6)',
      },
    },
  },
  plugins: [],
}
