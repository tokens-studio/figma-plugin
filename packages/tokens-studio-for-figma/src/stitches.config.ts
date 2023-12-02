// stitches.config.ts
import { createStitches } from '@stitches/react';
import { lightTheme, darkTheme, core } from '@tokens-studio/tokens';

export const stitchesInstance = createStitches({
  theme: {
    colors: {
      ...lightTheme.colors,
      buttonPrimaryBgRest: 'red',
      proBg: '#e1d8ec',
      proBorder: '#c2b2d8',
      proFg: '#694993',
    },
    shadows: lightTheme.shadows,
    ...core,
    sizes: {
      ...core.sizes,
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
    proBg: '#e1d8ec',
    proBorder: '#c2b2d8',
    proFg: '#694993',
  },
  shadows: lightTheme.shadows,
});

const darkThemeMode = createTheme('figma-dark', {
  colors: {
    ...darkTheme.colors,
    proBg: '#402d5a',
    proBorder: '#694993',
    proFg: '#c2b2d8',
  },
  shadows: darkTheme.shadows,
});

export {
  lightThemeMode, darkThemeMode, styled, css, keyframes, theme, globalCss,
};
