import { AnyTokenList, SingleToken } from '@/types/tokens';
import { generateTokensToCreate } from './generateTokensToCreate';
import { ThemeObject, UsedTokenSetsMap } from '@/types';
import { SettingsState } from '@/app/store/models/settings';
import checkIfTokenCanCreateVariable from '@/utils/checkIfTokenCanCreateVariable';
import setValuesOnVariable from './setValuesOnVariable';
import { mapTokensToVariableInfo } from '@/utils/mapTokensToVariableInfo';
import { TokenResolver } from '@/utils/TokenResolver';
import { getAliasValue } from '@/utils/alias';

export type CreateVariableTypes = {
  collection: VariableCollection;
  mode: string;
  theme: ThemeObject;
  tokens: Record<string, AnyTokenList>;
  settings: SettingsState;
  filterByTokenSet?: string;
  overallConfig: UsedTokenSetsMap;
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

  // Do not use getVariablesWithoutZombies. It's not working.
  // There seems to be a bug with getLocalVariablesAsync. It's not returning the variables in the collection - when they're being created.
  // We could also get the current collection with figma.variables.getVariableCollectionByIdAsync(collection.id) and then fetch each variable,
  // but that feels costly? We might need to double check this though.
  // e.g. this wont work.
  // const variablesInCollection = (await figma.variables.getLocalVariablesAsync()).filter((v) => v.variableCollectionId === collection.id);
  const variablesInCollection = figma.variables
    .getLocalVariables()
    .filter((v) => v.variableCollectionId === collection.id);

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
