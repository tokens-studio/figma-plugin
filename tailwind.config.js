module.exports = {
  content: ['./app/src/**/*.html', './src/app/**/*.tsx', './src/app/**/*.jsx'],
  important: true,
  theme: {
    extend: {
      colors: {
        gray: {
          // TODO: get rid of these as we want to remove tailwind
          100: 'var(--figma-color-bg-tertiary, #f5f5f5)',
          200: 'var(--figma-color-border, #eeeeee)',
          300: 'var(--figma-color-border, #eeeeee)',
          400: 'var(--figma-color-text-secondary, #9e9e9e)',
          500: 'var(--figma-color-text-secondary, #9e9e9e)',
          600: 'var(--figma-color-text-secondary, #9e9e9e)',
          700: 'var(--figma-color-text-secondary, #9e9e9e)',
        },
        modal: 'var(--figma-color-bg, #fff)',
        input: 'var(--figma-color-bg-secondary, #f5f5f5)',
        brand: 'var(--figma-color-bg-brand, #0070f3)',
        'icon-brand': 'var(--figma-color-icon-brand, #0070f3)',
        foreground: {
          DEFAULT: 'var(--figma-color-text, #ffffff)',
          muted: 'var(--figma-color-text-secondary, #9e9e9e)',
        },
        background: {
          DEFAULT: 'var(--figma-color-bg, #ffffff)',
          subtle: 'var(--figma-color-bg-secondary, #f5f5f5)',
          hover: 'var(--figma-color-bg-hover, #f5f5f5)',
        },
        border: {
          menu: 'var(--figma-color-border-menu, #eeeeee)',
          muted: 'var(--figma-color-border, #e0e0e0)',
        },
        primary: {
          100: 'var(--figma-color-bg-brand-tertiary, #E1F3FF)',
          400: 'var(--figma-color-bg-brand, #3CB1FF)',
          500: 'var(--figma-color-bg-brand, #18A0FB)',
        },
      },
      fontSize: {
        xxs: '0.7rem',
      },
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrainsMono', 'monospace'],
      },
      zIndex: {
        1: '1',
      },
      boxShadow: (theme) => ({
        focus: `0 0 0 2px var(--figma-color-border-selected)`,
        'focus-subtle': `0 0 0 2px var(--figma-color-border-selected)`,
        'focus-muted': `0 0 0 2px var(--figma-color-border-selected)`,
        border: '0 0 0 1px',
      }),
    },
  },
  corePlugins: {
    preflight: false,
  },
};
