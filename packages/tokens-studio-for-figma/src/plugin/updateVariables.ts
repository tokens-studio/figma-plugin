import { AnyTokenList, SingleToken } from '@/types/tokens';
import { generateTokensToCreate } from './generateTokensToCreate';
import { ThemeObject, UsedTokenSetsMap } from '@/types';
import { SettingsState } from '@/app/store/models/settings';
import checkIfTokenCanCreateVariable from '@/utils/checkIfTokenCanCreateVariable';
import setValuesOnVariable from './setValuesOnVariable';
import { mapTokensToVariableInfo } from '@/utils/mapTokensToVariableInfo';
import { TokenResolver } from '@/utils/TokenResolver';
import { getAliasValue } from '@/utils/alias';
import { resolveCollectionContext } from './extendedCollections/collectionContext';

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
  serverResolvedTokens?: Record<string, string> | null;
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
  serverResolvedTokens,
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
    serverResolvedTokens,
  });

  // Resolve the base font size for this specific theme using the same resolved tokens
  let themeBaseFontSize = settings.baseFontSize;
  if (settings.aliasBaseFontSize) {
    const resolvedBaseFontSize = getAliasValue(settings.aliasBaseFontSize, resolvedTokens);
    if (
      resolvedBaseFontSize !== undefined
      && resolvedBaseFontSize !== null
      && (typeof resolvedBaseFontSize === 'string' || typeof resolvedBaseFontSize === 'number')
    ) {
      themeBaseFontSize = String(resolvedBaseFontSize);
    }
  }

  // Reliable extended-collection detection: theme metadata first, then the Figma
  // runtime property, then structural (any mode carrying a parentModeId).
  const isExtendedCollection = resolveCollectionContext(collection, mode, theme).isExtended
    || Boolean(collection.modes?.some((m) => (m as any).parentModeId !== undefined));

  // For extended collections, variables are inherited from the parent collection
  let variablesInCollection: Variable[];

  if (isExtendedCollection) {
    // Union of the extended collection's own variables and the parent's variables,
    // deduped by name with the child's own variables taking priority. Using only
    // one source drops inherited-only variables as soon as the child has any own
    // variable of its own.
    const parentCollectionId = (collection as any).parentVariableCollectionId;
    const allLocalVariables = figma.variables.getLocalVariables();
    const extendedVars = allLocalVariables.filter((v) => v.variableCollectionId === collection.id);
    const parentVars = parentCollectionId
      ? allLocalVariables.filter((v) => v.variableCollectionId === parentCollectionId)
      : [];
    const byName = new Map<string, Variable>();
    parentVars.forEach((v) => byName.set(v.name, v));
    extendedVars.forEach((v) => byName.set(v.name, v));
    variablesInCollection = Array.from(byName.values());
  } else {
    // Regular collection: get variables from this collection
    variablesInCollection = figma.variables.getLocalVariables().filter((v) => v.variableCollectionId === collection.id);
  }

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
    mode, // Use extended collection's own mode ID
    themeBaseFontSize,
    settings.renameExistingStylesAndVariables,
    progressTracker,
    metadataUpdateTracker,
    providedPlatformsByVariable,
    isExtendedCollection,
  );

  const removedVariables: string[] = [];

  // Remove variables not handled in the current theme
  // CRITICAL: NEVER remove variables for extended collections!
  // Extended collections only override a SUBSET of parent variables.
  // Removing non-matches would delete the parent's variables!
  if (!isExtendedCollection && settings.removeStylesAndVariablesWithoutConnection) {
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
