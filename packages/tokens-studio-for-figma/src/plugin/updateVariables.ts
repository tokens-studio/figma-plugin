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

  // For extended collections, variables are inherited from the parent collection
  // So we need to get the parent collection's variables, not the extended collection's
  let variablesInCollection: Variable[];

  if (theme.$figmaIsExtension && theme.$figmaParentCollectionId) {
    // Extended collection: get variables from parent collection
    console.log('Getting variables from parent collection for extended theme:', theme.name);
    variablesInCollection = figma.variables
      .getLocalVariables()
      .filter((v) => v.variableCollectionId === theme.$figmaParentCollectionId);
    console.log(`Found ${variablesInCollection.length} inherited variables from parent`);
  } else {
    // Regular collection: get variables from this collection
    variablesInCollection = figma.variables
      .getLocalVariables()
      .filter((v) => v.variableCollectionId === collection.id);
  }

  const variablesToCreate: VariableToken[] = [];
  tokensToCreate.forEach((token) => {
    if (checkIfTokenCanCreateVariable(token, settings)) {
      variablesToCreate.push(mapTokensToVariableInfo(token, theme, settings, themeBaseFontSize));
    }
  });

  const variableObj = await setValuesOnVariable(
    variablesInCollection,
    variablesToCreate,
    collection,
    mode,
    themeBaseFontSize,
    settings.renameExistingStylesAndVariables,
    progressTracker,
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
