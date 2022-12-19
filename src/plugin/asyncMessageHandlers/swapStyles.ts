import { UpdateMode } from '@/constants/UpdateMode';
import { ThemeObjectsList } from '@/types';
import { StyleIdMap, StyleThemeMap } from '@/types/StyleIdMap';
import { applySiblingStyleId } from './applySiblingStyle';
import { defaultNodeManager } from '../NodeManager';

// Go through layers to swap styles
export async function swapStyles(activeTheme: string, themes: ThemeObjectsList, updateMode: UpdateMode) {
  const newTheme = themes.find((theme) => theme.id === activeTheme)?.name;
  // Creates an object that groups sibling styles by token name and theme name, e.g. { 'color.background': { 'dark': 'S:1234,4:16', 'light': 'S:1235,4:16' } }
  const mappedStyleReferences = themes.reduce((acc, theme) => {
    if (theme.$figmaStyleReferences) {
      Object.entries(theme.$figmaStyleReferences).forEach(([styleName, styleId]) => {
        acc[styleName] = { ...acc[styleName], [theme.name]: styleId };
      });
    }
    return acc;
  }, {} as StyleThemeMap);

  // Creates an object that maps styleIds to token names, e.g. { 'S:1234,4:16': 'color.background' }
  const allStyleIds = Object.entries(mappedStyleReferences).reduce((acc, [tokenName, mapping]) => {
    Object.values(mapping).forEach((styleId) => {
      acc[styleId] = tokenName;
    });
    return acc;
  }, {} as StyleIdMap);
  if (!newTheme || !mappedStyleReferences || !allStyleIds) {
    return;
  }

  const nodes = (await defaultNodeManager.findNodesWithData({ updateMode })).map((node) => node.node);

  nodes.forEach((layer) => {
    applySiblingStyleId(layer, allStyleIds, mappedStyleReferences, newTheme);
  });
}
