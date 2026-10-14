// stitches.config.ts
import { createStitches } from '@stitches/react';
import { lightFigmaTheme as lightTheme, darkFigmaTheme as darkTheme, core } from '@tokens-studio/tokens';

// The launch screens are always dark, regardless of the Figma theme.
const launchScreenColors = {
  loadingScreenBg: '#0B0A0F',
  loadingScreenFg: '#FCFCFC',
  loadingScreenFgSubtle: 'rgba(252, 252, 252, 0.8)',
  loadingScreenFgMuted: 'rgba(252, 252, 252, 0.6)',
  loadingScreenBorder: 'rgba(252, 252, 252, 0.24)',
  loadingScreenSeparator: 'rgba(255, 255, 255, 0.4)',
};

export const stitchesInstance = createStitches({
  theme: {
    colors: {
      ...lightTheme.colors,
      // TODO: We need to add these to the ui tokens.
      proBg: '#e1d8ec',
      proBorder: '#c2b2d8',
      proFg: '#694993',
      ...launchScreenColors,
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
    ...launchScreenColors,
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
    ...launchScreenColors,
  },
  shadows: darkTheme.shadows,
});

export {
  lightThemeMode, darkThemeMode, styled, css, keyframes, theme, globalCss,
};
