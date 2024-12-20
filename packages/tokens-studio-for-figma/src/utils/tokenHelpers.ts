import { appendTypeToToken } from '@/app/components/createTokenObj';
import { SingleToken } from '@/types/tokens';
import { ThemeObject, UsedTokenSetsMap } from '@/types';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { getTokenSetsOrder } from './getTokenSetsOrder';

export type ResolveTokenValuesResult = SingleToken<
true,
{
  failedToResolve?: boolean;
}
>;

export function getOverallConfig(themes: ThemeObject[], selectedThemes: string[]) {
  return selectedThemes.reduce((acc, themeId) => {
    const currentTheme = themes.find((theme) => theme.id === themeId);
    if (!currentTheme) return acc;

    Object.entries(currentTheme.selectedTokenSets).forEach(([tokenSet, status]) => {
      // If the set is enabled, set it. Meaning, it should always win.
      if (status === TokenSetStatus.ENABLED) {
        acc[tokenSet] = status;
        // If the set is source, only set it to source if it wasnt set to enabled.
      } else if (status === TokenSetStatus.SOURCE && acc[tokenSet] !== TokenSetStatus.ENABLED) {
        acc[tokenSet] = status;
      }
    });
    return acc;
  }, {} as Record<string, TokenSetStatus>);
}

export function getEnabledTokenSets(usedSets: UsedTokenSetsMap = {}) {
  return Object.keys(usedSets)
    .filter((key) => usedSets[key] === TokenSetStatus.ENABLED)
    .map((tokenSet) => tokenSet);
}

export function mergeTokenGroups(
  tokens: Record<string, SingleToken[]>,
  usedSets: UsedTokenSetsMap = {},
  overallConfig: UsedTokenSetsMap = {},
  activeTokenSet?: string,
): SingleToken[] {
  const { tokenSetsOrder, usedSetsList, overallSets } = getTokenSetsOrder(
    tokens,
    usedSets,
    overallConfig,
    activeTokenSet,
  );

  // Helper to determine if a token should be merged. We only merge object tokens if the current set is enabled (to avoid accidental merges)
  const shouldMerge = (currentSet: string, existingToken: SingleToken) => usedSetsList.includes(currentSet)
    && existingToken.internal__Parent
    && !overallSets.includes(existingToken.internal__Parent);

  return tokenSetsOrder.reduce((mergedTokens, setName) => {
    const setTokens = tokens[setName] || [];
    setTokens.forEach((token) => {
      const existingIndex = mergedTokens.findIndex((t) => t.name === token.name);
      const existingToken = mergedTokens[existingIndex];
      const newToken = {
        ...appendTypeToToken(token),
        internal__Parent: setName,
      } as SingleToken;

      if (existingIndex === -1) {
        // If the token does not exist yet, add it.
        mergedTokens.push(newToken);
      } else if (
        shouldMerge(setName, existingToken)
        && existingIndex > -1
        && typeof existingToken.value === 'object'
        && typeof newToken.value === 'object'
        && !Array.isArray(existingToken.value)
        && !Array.isArray(newToken.value)
      ) {
        // If the token should be merged, and is an object - and not an array, merge them (e.g. composition, typography)
        mergedTokens.splice(existingIndex, 1, {
          ...newToken,
          value: {
            ...existingToken.value,
            ...newToken.value,
          },
        } as SingleToken);
      } else {
        // In all other cases, just replace.
        mergedTokens[existingIndex] = newToken;
      }
    });
    return mergedTokens;
  }, [] as SingleToken[]);
}
