import { UpdateMode } from '@/constants/UpdateMode';
import { ThemeObjectsList } from '@/types';
import { StyleIdMap, StyleThemeMap } from '@/types/StyleIdMap';
import { applySiblingStyleId } from './applySiblingStyle';

function getRootNode(updateMode: UpdateMode) {
  const rootNode = [];
  switch (updateMode) {
    case UpdateMode.PAGE:
      if (figma.currentPage.children) rootNode.push(...figma.currentPage.children);
      break;
    case UpdateMode.SELECTION:
      if (figma.currentPage.selection) rootNode.push(...figma.currentPage.selection);
      break;
    case UpdateMode.DOCUMENT:
      figma.root.children.forEach((page) => rootNode.push(...page.children));
      break;
    default:
      rootNode.push(...figma.currentPage.children);
      break;
  }
  return rootNode;
}

// Go through layers to swap styles
export async function swapStyles(activeTheme: Record<string, string>, themes: ThemeObjectsList, updateMode: UpdateMode) {
  const activeThemes = themes.filter((theme) => Object.values(activeTheme).some((v) => v === theme.id)).map((t) => t.name);
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
  if (activeThemes.length < 1 || !mappedStyleReferences || !allStyleIds) {
    return;
  }

  getRootNode(updateMode).forEach((layer) => {
    applySiblingStyleId(layer, allStyleIds, mappedStyleReferences, activeThemes);
  });
}
