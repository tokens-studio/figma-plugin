import { TokenType } from '@supernovaio/supernova-sdk';
import { TokenTypes } from '@tokens-studio/types';
import { appendTypeToToken } from '@/app/components/createTokenObj';
import { SingleToken } from '@/types/tokens';
import { ThemeObject, UsedTokenSetsMap } from '@/types';
import { TokenSetStatus } from '@/constants/TokenSetStatus';

export type ResolveTokenValuesResult = SingleToken<true, {
  failedToResolve?: boolean
}>;

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

export function getMergedConfig(tokens: Record<string, SingleToken[]>, usedSets: UsedTokenSetsMap = {}, overallConfig: UsedTokenSetsMap = {}): string[] {
  const sortSets = (a: string, b: string, config: UsedTokenSetsMap) => {
    const statusA = config[a] || TokenSetStatus.DISABLED;
    const statusB = config[b] || TokenSetStatus.DISABLED;
    if (statusA === statusB) return 0;
    if (statusA === TokenSetStatus.ENABLED) return 1;
    if (statusB === TokenSetStatus.ENABLED) return -1;
    if (statusA === TokenSetStatus.SOURCE) return 1;
    if (statusB === TokenSetStatus.SOURCE) return -1;
    return 0;
  };

  const overallSets = Object.keys(tokens).sort((a, b) => sortSets(a, b, overallConfig));
  const usedSetsList = Object.keys(usedSets).sort((a, b) => sortSets(a, b, usedSets));

  const tokenSetsOrder = [...overallSets, ...usedSetsList];

  return tokenSetsOrder;
}

export function getEnabledTokenSets(usedSets: UsedTokenSetsMap = {}) {
  return Object.keys(usedSets).filter((key) => usedSets[key] === TokenSetStatus.ENABLED).map((tokenSet) => tokenSet);
}

export function getTokensToCreateBasedOnSettings({
  tokens, shouldCreateColor, shouldCreateType, shouldCreateShadows,
}: { tokens: ResolveTokenValuesResult[], shouldCreateColor: boolean, shouldCreateType: boolean, shouldCreateShadows: boolean }) {
  return tokens.filter((token) => {
    if (shouldCreateColor && token.type === TokenTypes.COLOR) return true;
    if (shouldCreateType && token.type === TokenTypes.TYPOGRAPHY) return true;
    if (shouldCreateShadows && token.type === TokenTypes.BOX_SHADOW) return true;
    return false;
  });
}

export function mergeTokenGroups(tokens: Record<string, SingleToken[]>, usedSets: UsedTokenSetsMap = {}, overallConfig: UsedTokenSetsMap = {}, activeTokenSet?: string): SingleToken[] {
  const sortSets = (a: string, b: string, config: UsedTokenSetsMap) => {
    if (a === activeTokenSet) return 1;
    if (b === activeTokenSet) return -1;
    const statusA = config[a] || TokenSetStatus.DISABLED;
    const statusB = config[b] || TokenSetStatus.DISABLED;
    if (statusA === statusB) return 0;
    if (statusA === TokenSetStatus.ENABLED) return 1;
    if (statusB === TokenSetStatus.ENABLED) return -1;
    if (statusA === TokenSetStatus.SOURCE) return 1;
    if (statusB === TokenSetStatus.SOURCE) return -1;
    return 0;
  };

  const overallSets = Object.keys(tokens).sort((a, b) => sortSets(a, b, overallConfig));
  const usedSetsList = Object.keys(usedSets).sort((a, b) => sortSets(a, b, usedSets));

  const tokenSetsOrder = [...overallSets, ...usedSetsList];

  console.log('tokenSetsOrder', tokenSetsOrder);

  return tokenSetsOrder.reduce((mergedTokens, setName) => {
    const setTokens = tokens[setName] || [];
    setTokens.forEach((token) => {
      const existingIndex = mergedTokens.findIndex((t) => t.name === token.name);
      const newToken = {
        ...appendTypeToToken(token),
        internal__Parent: setName,
      } as SingleToken;

      if (existingIndex === -1) {
        mergedTokens.push(newToken);
      } else {
        // Always replace existing tokens
        mergedTokens[existingIndex] = newToken;
      }
    });
    return mergedTokens;
  }, [] as SingleToken[]);
}
