import { appendTypeToToken } from '@/app/components/createTokenObj';
import { SingleToken } from '@/types/tokens';
import { UsedTokenSetsMap } from '@/types';
import { TokenSetStatus } from '@/constants/TokenSetStatus';

export type ResolveTokenValuesResult = SingleToken<true, {
  failedToResolve?: boolean
}>;

export function mergeTokenGroups(tokens: Record<string, SingleToken[]>, usedSets: UsedTokenSetsMap = {}): SingleToken[] {
  // Big O(n * m * l): (n = amount of tokenSets, m = amount of tokens in a tokenSet, l = amount of tokens)
  const mergedTokens: SingleToken[] = [];
  // @README we will use both ENABLED and SOURCE sets
  // we only need to ignore the SOURCE sets when creating styles
  const tokenSetsToMerge = Object.entries(usedSets)
    .filter(([, status]) => status === TokenSetStatus.ENABLED || status === TokenSetStatus.SOURCE)
    .map(([tokenSet]) => tokenSet);

  const tokenSetOrder = tokens?.$metadata?.map(({ value }) => value);

  const tokenEntries = tokenSetOrder ? Object.entries(tokens)
    .sort((a, b) => tokenSetOrder.indexOf(a[0]) - tokenSetOrder.indexOf(b[0])) : Object.entries(tokens);

  // Reverse token set order (right-most win) and check for duplicates
  tokenEntries
    .reverse()
    .forEach((tokenGroup: [string, SingleToken[]]) => {
      if (tokenSetsToMerge.length === 0 || tokenSetsToMerge.includes(tokenGroup[0])) {
        tokenGroup[1].forEach((token) => {
          const mergedTokenIndex = mergedTokens.findIndex((t) => t.name === token.name);
          const mergedToken = mergedTokens[mergedTokenIndex];
          if (mergedTokenIndex < 0) {
            mergedTokens.push({
              ...appendTypeToToken(token),
              internal__Parent: tokenGroup[0],
            } as SingleToken);
          }
          if (mergedTokenIndex > -1 && Array.isArray(mergedToken.value) && Array.isArray(token.value)) {
            mergedTokens.splice(mergedTokenIndex, 1, mergedToken);
          } else if (mergedTokenIndex > -1 && typeof mergedToken.value === 'object' && typeof token.value === 'object') {
            mergedTokens.splice(mergedTokenIndex, 1, {
              ...mergedToken,
              value: {
                ...token.value,
                ...mergedToken.value,
              },
            } as SingleToken);
          }
        });
      }
    });

  return mergedTokens;
}
