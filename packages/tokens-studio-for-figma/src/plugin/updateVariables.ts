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

  // Check if this collection is an extended collection using Figma's actual API properties
  const isExtendedCollection = 'isExtension' in collection && (collection as any).isExtension;

  // For extended collections, variables are inherited from the parent collection
  // Extended collections have an 'isExtension' property and 'parentVariableCollectionId' pointing to their parent
  let variablesInCollection: Variable[];

  if (isExtendedCollection) {
    // Extended collections have their own variable objects (variableCollectionId === collection.id)
    // that are aware of the extended collection's modes. Use those first.
    // Fall back to parent collection variables for inherited-only scenarios.
    const parentCollectionId = (collection as any).parentVariableCollectionId;
    const extendedVars = figma.variables.getLocalVariables().filter((v) => v.variableCollectionId === collection.id);
    console.log(`[updateVariables] Extended collection "${collection.name}": found ${extendedVars.length} own vars, ${figma.variables.getLocalVariables().filter((v) => v.variableCollectionId === parentCollectionId).length} parent vars`);
    variablesInCollection = extendedVars.length > 0
      ? extendedVars
      : figma.variables.getLocalVariables().filter((v) => v.variableCollectionId === parentCollectionId);
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
    isExtendedCollection,
    metadataUpdateTracker,
    providedPlatformsByVariable,
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
