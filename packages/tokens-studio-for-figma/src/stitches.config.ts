// stitches.config.ts
import { createStitches } from '@stitches/react';
import * as core from './tokens/core';
import * as lightTheme from './tokens/light';
import * as darkTheme from './tokens/dark';

export const stitchesInstance = createStitches({
  media: {
    xs: '(min-width: 300px)',
    sm: '(min-width: 360px)',
    md: '(min-width: 480px)',
    lg: '(min-width: 768px)',
  },
  theme: {
    colors: lightTheme.colors,
    shadows: lightTheme.shadows,
    ...core,
  },
});

const {
  createTheme, styled, css, keyframes, theme, globalCss,
} = stitchesInstance;

const lightThemeMode = createTheme('figma-light', {
  colors: lightTheme.colors,
  shadows: lightTheme.shadows,
});

const darkThemeMode = createTheme('figma-dark', {
  colors: darkTheme.colors,
  shadows: darkTheme.shadows,
});

export {
  lightThemeMode, darkThemeMode, styled, css, keyframes, theme, globalCss,
};
