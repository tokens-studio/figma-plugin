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

  // Check if this collection is an extended collection using Figma's actual API properties
  const isExtendedCollection = 'isExtension' in collection && (collection as any).isExtension;





  // For extended collections, variables are inherited from the parent collection
  // Extended collections have an 'isExtension' property and 'parentVariableCollectionId' pointing to their parent
  let variablesInCollection: Variable[];

  if (isExtendedCollection) {
    // Extended collection: get variables from parent collection (where they're defined)
    // We'll use extended mode IDs to create overrides
    const parentCollectionId = (collection as any).parentVariableCollectionId;




    variablesInCollection = figma.variables
      .getLocalVariables()
      .filter((v) => v.variableCollectionId === parentCollectionId);



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
    mode, // Use extended collection's own mode ID
    themeBaseFontSize,
    settings.renameExistingStylesAndVariables,
    progressTracker,
    isExtendedCollection,
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
