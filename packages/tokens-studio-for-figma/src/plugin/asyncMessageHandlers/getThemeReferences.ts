import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { RawVariableReferenceMap } from '@/types/RawVariableReferenceMap';
import { defaultTokenValueRetriever } from '../TokenValueRetriever';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { getVariablesWithoutZombies } from '../getVariablesWithoutZombies';
import { normalizeVariableName } from '@/utils/normalizeVariableName';

export async function getThemeReferences(prefixStylesWithThemeName?: boolean) {
  defaultTokenValueRetriever.clearCache();

  const themeInfo = await AsyncMessageChannel.PluginInstance.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });

  const figmaStyleReferences: Map<string, string> = new Map();
  const figmaVariableReferences: RawVariableReferenceMap = new Map();

  const activeThemes = themeInfo.themes?.filter((theme) => Object.values(themeInfo.activeTheme).some((v) => v === theme.id));

  const stylePathPrefix = prefixStylesWithThemeName && activeThemes.length > 0 ? activeThemes[0].name : undefined;

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

  // We'll also add variables of source token sets to the references to properly resolve variables when used in styles
  const allSourceTokenSetsOfActiveThemes = activeThemes.map((theme) => Object.entries(theme.selectedTokenSets)
    .filter(([_, status]) => status === TokenSetStatus.SOURCE)) // filter only for source sets
    .map((theme) => Object.keys(theme).filter((key) => theme[key] === TokenSetStatus.SOURCE)).flat(); // just return name

  // Get all themes containing the source token sets
  const allThemesContainingSourceTokenSets = themeInfo.themes.filter((theme) => allSourceTokenSetsOfActiveThemes
    .some((sourceTokenSet) => theme.selectedTokenSets[sourceTokenSet] === TokenSetStatus.ENABLED)); // Just get those where its enabled

  allThemesContainingSourceTokenSets?.forEach((theme) => {
    Object.entries(theme.$figmaVariableReferences ?? {}).forEach(([token, variableId]) => {
      if (!figmaVariableReferences.has(token)) {
        figmaVariableReferences.set(token, variableId);
      }
    });
  });

  // We'll also add local variables to the references in case of where we work with local sets
  const localVariables = await getVariablesWithoutZombies();

  localVariables.forEach((variable) => {
    const normalizedVariableName = normalizeVariableName(variable.name); // adjusting variable name to match the token name
    if (!figmaVariableReferences.has(normalizedVariableName)) {
      figmaVariableReferences.set(normalizedVariableName, variable.key);
    }
  });

  const effectStyles = figma.getLocalEffectStyles();
  const paintStyles = figma.getLocalPaintStyles();
  const textStyles = figma.getLocalTextStyles();
  const localStyles = [...effectStyles, ...paintStyles, ...textStyles];

  // We'll also add local styles to the references in case of where we work with local sets
  localStyles.forEach((style) => {
    if (!figmaStyleReferences.has(style.name)) {
      const normalizedStyleName = normalizeVariableName(style.name); // adjusting variable name to match the token name
      figmaStyleReferences.set(normalizedStyleName, style.id);
    }
  });

  return {
    figmaStyleReferences, figmaVariableReferences, stylePathPrefix,
  };
}
