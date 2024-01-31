// stitches.config.ts
import { createStitches } from '@stitches/react';
import { lightTheme, darkTheme, core } from '@tokens-studio/tokens';

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
      xsmall: '12px !important',
      small: '13px !important',
      medium: '14px !important',
      large: '16px !important',
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

export {
  lightThemeMode, darkThemeMode, styled, css, keyframes, theme, globalCss,
};
