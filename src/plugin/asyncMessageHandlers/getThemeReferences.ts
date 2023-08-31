import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { VariableReferenceMap } from '@/types/VariableReferenceMap';
import { getAllFigmaStyleMaps } from '@/utils/getAllFigmaStyleMaps';

export async function getThemeReferences(prefixStylesWithThemeName?: boolean) {
  const figmaStyleMaps = getAllFigmaStyleMaps();

  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });

  const figmaStyleReferences: Record<string, string> = {};
  const figmaVariableReferences: VariableReferenceMap = new Map();

  const activeThemes = themeInfo.themes?.filter((theme) => Object.values(themeInfo.activeTheme).some((v) => v === theme.id));
  const stylePathPrefix = prefixStylesWithThemeName && activeThemes.length > 0 ? activeThemes[0].name : undefined;

  await Promise.all(activeThemes?.map(async (theme) => {
    await Promise.all(Object.entries(theme.$figmaVariableReferences ?? {}).map(async ([token, variableId]) => {
      try {
        const foundVariableId = await figma.variables.importVariableByKeyAsync(variableId);
        if (foundVariableId) {
          figmaVariableReferences.set(token, foundVariableId);
        }
      } catch (e) {
        console.error(e);
      }
    }));
    Object.entries(theme.$figmaStyleReferences ?? {}).forEach(([token, styleId]) => {
      if (!figmaStyleReferences[token]) {
        figmaStyleReferences[token] = styleId;
      }
    });
  }));

  return {
    figmaStyleMaps, figmaStyleReferences, figmaVariableReferences, stylePathPrefix,
  };
}
