import { AnyTokenList, SingleToken } from '@/types/tokens';
import { generateTokensToCreate } from './generateTokensToCreate';
import { ThemeObject, UsedTokenSetsMap } from '@/types';
import { SettingsState } from '@/app/store/models/settings';
import checkIfTokenCanCreateVariable from '@/utils/checkIfTokenCanCreateVariable';
import setValuesOnVariable from './setValuesOnVariable';
import { mapTokensToVariableInfo } from '@/utils/mapTokensToVariableInfo';
import { TokenResolver } from '@/utils/TokenResolver';
import { getAliasValue } from '@/utils/alias';

import { ProgressTracker } from './ProgressTracker';

export type CreateVariableTypes = {
  collection: VariableCollection;
  mode: string;
  theme: ThemeObject;
  tokens: Record<string, AnyTokenList>;
  settings: SettingsState;
  filterByTokenSet?: string;
  overallConfig: UsedTokenSetsMap;
  progressTracker?: ProgressTracker | null;
  metadataUpdateTracker?: Record<string, boolean>;
  providedPlatformsByVariable?: Record<string, Set<string>>;
};

export type VariableToken = SingleToken<true, { path: string; variableId: string }>;

export default async function updateVariables({
  collection,
  mode,
  theme,
  tokens,
  settings,
  filterByTokenSet,
  overallConfig,
  progressTracker,
  metadataUpdateTracker,
  providedPlatformsByVariable,
}: CreateVariableTypes) {
  // Create a separate TokenResolver instance for this theme to avoid interference
  // when multiple themes are processed concurrently
  const themeTokenResolver = new TokenResolver([]);

  const { tokensToCreate, resolvedTokens } = generateTokensToCreate({
    theme,
    tokens,
    filterByTokenSet,
    overallConfig,
    themeTokenResolver,
  });

  // Resolve the base font size for this specific theme using the same resolved tokens
  let themeBaseFontSize = settings.baseFontSize;
  if (settings.aliasBaseFontSize) {
    const resolvedBaseFontSize = getAliasValue(settings.aliasBaseFontSize, resolvedTokens);
    if (resolvedBaseFontSize && typeof resolvedBaseFontSize === 'string') {
      themeBaseFontSize = resolvedBaseFontSize;
    }
  }

  // Use getLocalVariablesAsync for FRESHER data, especially important when running multiple themed updates
  // in a single export run.
  const variablesInCollection = (await figma.variables.getLocalVariablesAsync())
    .filter((v) => v.variableCollectionId === collection.id);

  const variablesToCreate: VariableToken[] = [];
  // Reverse iterate to keep the last occurrence (override)
  // But we need to filter, so maybe a Map is better?
  const uniqueTokensMap = new Map<string, typeof tokensToCreate[0]>();

  tokensToCreate.forEach((token) => {
    // If we have duplicates, the last one visited (in standard set iteration) usually wins in the UI
    // But checking for duplicates is important
    if (checkIfTokenCanCreateVariable(token, settings)) {
      if (uniqueTokensMap.has(token.name)) {
        console.warn(`Duplicate token found for path: ${token.name}. Using the latest definition.`);
      }
      uniqueTokensMap.set(token.name, token);
    }
  });

  Array.from(uniqueTokensMap.values()).forEach((token) => {
    variablesToCreate.push(mapTokensToVariableInfo(token, theme, settings, themeBaseFontSize));
  });

  const variableObj = await setValuesOnVariable(
    variablesInCollection,
    variablesToCreate,
    collection,
    mode,
    themeBaseFontSize,
    settings.renameExistingStylesAndVariables,
    progressTracker,
    metadataUpdateTracker,
    providedPlatformsByVariable,
  );

  const removedVariables: string[] = [];

  // Remove variables not handled in the current theme
  if (settings.removeStylesAndVariablesWithoutConnection) {
    variablesInCollection
      .filter((variable) => !Object.values(variableObj.variableKeyMap).includes(variable.key))
      .forEach((variable) => {
        removedVariables.push(variable.key);
        variable.remove();
      });
  }

  return {
    variableIds: variableObj.variableKeyMap,
    referenceVariableCandidate: variableObj.referenceVariableCandidates,
    removedVariables,
  };
}
