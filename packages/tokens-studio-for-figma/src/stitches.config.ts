// stitches.config.ts
import { createStitches } from '@stitches/react';
import { lightFigmaTheme as lightTheme, darkFigmaTheme as darkTheme, core } from '@tokens-studio/tokens';

export const stitchesInstance = createStitches({
  theme: {
    colors: {
      ...lightTheme.colors,
      // TODO: We need to add these to the ui tokens.
      proBg: '#e1d8ec',
      proBorder: '#c2b2d8',
      proFg: '#694993',
    },
    shadows: lightTheme.shadows,
    ...core,
    fontWeights: {
      ...core.fontWeights,
      // TODO: We should likely make everything 500 and get rid of 600
      sansBold: 500,
    },
    fontSizes: {
      ...core.fontSizes,
      // TODO: We should remove this once we have a way to choose density / font size
      xxsmall: '11px !important',
      xsmall: '11px !important',
      small: '12px !important',
      base: '13px !important',
      medium: '13px !important',
      large: '14px !important',
    },
    radii: {
      ...core.radii,
      // TODO: Add to tokens
      full: '999px',
    },
    sizes: {
      ...core.sizes,
      // TODO: Add to tokens
      scrollbarWidth: '8px',
    },
  },
});

const {
  createTheme, styled, css, keyframes, theme, globalCss,
} = stitchesInstance;

const lightThemeMode = createTheme('figma-light', {
  colors: {
    ...lightTheme.colors,
    // TODO: We need to add these to the ui tokens.
    proBg: '#e1d8ec',
    proBorder: '#c2b2d8',
    proFg: '#694993',
  },
  shadows: lightTheme.shadows,
});

const darkThemeMode = createTheme('figma-dark', {
  colors: {
    ...darkTheme.colors,
    // TODO: We need to add these to the ui tokens.
    proBg: '#402d5a',
    proBorder: '#694993',
    proFg: '#c2b2d8',
  },
  shadows: darkTheme.shadows,
});

const purpleThemeMode = createTheme('figma-purple', {
  colors: {
    ...lightTheme.colors,
    // Purple theme specific colors
    bgDefault: '#faf5ff', // purple.100
    bgMuted: '#e9d8fd', // purple.200
    bgSubtle: '#d6bcfa', // purple.300
    fgDefault: '#44337a', // purple.900
    fgMuted: '#6b46c1', // purple.700
    fgSubtle: '#9f7aea', // purple.500
    accentBase: '#805ad5', // purple.600
    accentEmphasis: '#6b46c1', // purple.700
    accentFg: '#ffffff', // white
    // Pro colors updated for purple theme
    proBg: '#e9d8fd',
    proBorder: '#805ad5',
    proFg: '#44337a',
  },
  shadows: {
    ...lightTheme.shadows,
    small: '0 1px 3px rgba(68, 51, 122, 0.12), 0 1px 2px rgba(68, 51, 122, 0.24)',
    medium: '0 4px 6px rgba(68, 51, 122, 0.07), 0 2px 4px rgba(68, 51, 122, 0.06)',
    large: '0 10px 15px rgba(68, 51, 122, 0.1), 0 4px 6px rgba(68, 51, 122, 0.05)',
  },
});

export {
  lightThemeMode, darkThemeMode, purpleThemeMode, styled, css, keyframes, theme, globalCss,
};
