import { StyleIdMap, StyleThemeMap } from '@/types/StyleIdMap';

const memo: StyleIdMap = {};

// Gets the sibling style for a given style considering the new theme
export async function getNewStyleId(styleId: string, styleIds: StyleIdMap, styleMap: StyleThemeMap, activeThemes: string[]) {
  if (!styleId) {
    return null;
  }

  // Removes the , 4:16 part after each style (we seem to store styleIds without that part)
  const normalizedStyleId = styleId.split(',')[0].concat(',');

  const tokenName = styleIds[normalizedStyleId];
  // If there is no figmaStyleReference for that token, we can't do anything
  if (!tokenName) {
    console.warn(`${normalizedStyleId} not found`);
    return null;
  }

  // Get the sibling style for the new theme
  const newTheme = Object.keys(styleMap[tokenName]).find((themeName) => activeThemes.includes(themeName));
  if (newTheme) {
    const newStyleToFetch = styleMap[tokenName][newTheme];

    // If there is none, return
    if (!newStyleToFetch) {
      console.warn(`${tokenName} for theme ${newTheme} not found`);
      return null;
    }

    let actualStyleId = newStyleToFetch;

    // If we already have the styleId in memory, return it
    if (memo.hasOwnProperty(newStyleToFetch)) {
      actualStyleId = memo[newStyleToFetch];
    } else {
      // Otherwise, fetch it and store it in memory
      // This fetches the remote style and returns the local styleId that we need to apply the token
      const styleKeyMatch = newStyleToFetch.match(/^S:([a-zA-Z0-9_-]+),/);
      if (styleKeyMatch) {
        actualStyleId = await new Promise<string>((resolve) => {
          figma.importStyleByKeyAsync(styleKeyMatch[1])
            .then((style) => resolve(style.id))
            .catch(() => resolve(newStyleToFetch));
        });
        memo[newStyleToFetch] = actualStyleId;
      }
    }

    const figmaStyle = figma.getStyleById(actualStyleId);

    // If there is no figmaStyle for that token, we can't do anything
    if (!figmaStyle) {
      console.warn(`figma style for ${tokenName} not found, ${newStyleToFetch}`);
      return null;
    }

    return figmaStyle.id;
  }
  return null;
}
