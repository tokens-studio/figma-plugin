// stitches.config.ts
import { createStitches } from "@stitches/react"
import { lightTheme, darkTheme, core } from "@tokens-studio/tokens"

export const stitchesInstance = createStitches({
  theme: {
    colors: lightTheme.colors,
    shadows: lightTheme.shadows,
    ...core,
  },
})

const {
  createTheme, styled, css, keyframes, theme, globalCss,
} = stitchesInstance

const lightThemeMode = createTheme('figma-light', {
  colors: lightTheme.colors,
  shadows: lightTheme.shadows,
})

const darkThemeMode = createTheme('figma-dark', {
  colors: darkTheme.colors,
  shadows: darkTheme.shadows,
})

export {
  lightThemeMode, darkThemeMode, styled, css, keyframes, theme, globalCss
}