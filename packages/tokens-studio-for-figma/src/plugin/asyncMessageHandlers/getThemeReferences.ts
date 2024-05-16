import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { RawVariableReferenceMap } from '@/types/RawVariableReferenceMap';
import { getAllFigmaStyleMaps } from '@/utils/getAllFigmaStyleMaps';
import { defaultTokenValueRetriever } from '../TokenValueRetriever';

export async function getThemeReferences(prefixStylesWithThemeName?: boolean) {
  defaultTokenValueRetriever.clearCache();
  const figmaStyleMaps = getAllFigmaStyleMaps();
  console.log('figmaStyleMaps in getThemeReferences: ', figmaStyleMaps);

  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });

  const figmaStyleReferences: Map<string, string> = new Map();
  const figmaVariableReferences: RawVariableReferenceMap = new Map();

  const activeThemes = themeInfo.themes?.filter((theme) => Object.values(themeInfo.activeTheme).some((v) => v === theme.id));
  const stylePathPrefix = prefixStylesWithThemeName && activeThemes.length > 0 ? activeThemes[0].name : undefined;

  figmaStyleMaps.paintStyles.forEach((style) => {
    if (!figmaStyleReferences.has(style.name)) {
      figmaStyleReferences.set(style.name, style.id);
    }
  });

  activeThemes?.forEach((theme) => {
    Object.entries(theme.$figmaVariableReferences ?? {}).forEach(([token, variableId]) => {
      if (!figmaVariableReferences.has(token)) {
        figmaVariableReferences.set(token, variableId);
      }
    });
    Object.entries(theme.$figmaStyleReferences ?? {}).forEach(([token, styleId]) => {
      if (!figmaStyleReferences.has(token)) {
        figmaStyleReferences.set(token, styleId);
      }
    });
  });

  // We'll also add local variables to the references in case of where we work with local sets
  const localVariables = await figma.variables.getLocalVariablesAsync();

  localVariables.forEach((variable) => {
    if (!figmaVariableReferences.has(variable.name)) {
      const normalizedVariableName = variable.name.split('/').join('.'); // adjusting variable name to match the token name
      figmaVariableReferences.set(normalizedVariableName, variable.key);
    }
  });

  return {
    figmaStyleMaps, figmaStyleReferences, figmaVariableReferences, stylePathPrefix,
  };
}
