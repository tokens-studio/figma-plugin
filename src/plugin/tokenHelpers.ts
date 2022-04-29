import { appendTypeToToken } from '@/app/components/createTokenObj';
import { SingleToken } from '@/types/tokens';
import { checkIfAlias, checkIfContainsAlias, getAliasValue } from '@/utils/alias';
import { isSingleToken } from '@/utils/is';
import { TokenTypes } from '@/constants/TokenTypes';
import { UsedTokenSetsMap } from '@/types';
import { TokenSetStatus } from '@/constants/TokenSetStatus';

export type ResolveTokenValuesResult = SingleToken<true, {
  failedToResolve?: boolean
}>;

export function findAllAliases(tokens: (SingleToken | string)[]) {
  return tokens.filter((token) => (
    checkIfAlias(token, tokens.filter(isSingleToken))
  ));
}

export function resolveTokenValues(tokens: SingleToken[], previousCount: number = 0): ResolveTokenValuesResult[] {
  const aliases = findAllAliases(tokens);
  let returnedTokens: ResolveTokenValuesResult[] = tokens;
  returnedTokens = tokens.map((t, _, tokensInProgress) => {
    let returnValue:
      Record<string, ReturnType<typeof getAliasValue>>[] |
      Record<string, ReturnType<typeof getAliasValue>> |
      ReturnType<typeof getAliasValue>;

    let _failedToResolve = false;
    // Iterate over Typography and boxShadow Object to get resolved values
    if (t.type === TokenTypes.TYPOGRAPHY || t.type === TokenTypes.BOX_SHADOW) {
      if (Array.isArray(t.value)) {
        // If we're dealing with an array, iterate over each item and then key
        returnValue = t.value.map((item) => (
          Object.entries(item).reduce<Record<string, ReturnType<typeof getAliasValue>>>((acc, [key, value]) => {
            acc[key] = getAliasValue(value, tokensInProgress);
            return acc;
          }, {})
        ));
        // If not, iterate over each key
      } else {
        returnValue = Object.entries(t.value).reduce<Record<string, ReturnType<typeof getAliasValue>>>((acc, [key, value]) => {
          acc[key] = getAliasValue(value, tokensInProgress);
          return acc;
        }, {});
      }
    }
    else if (t.type === TokenTypes.COMPOSITION && Array.isArray(t.value)) {
      returnValue = t.value.map((item) => {
        return {
          property: item.property,
          value: getAliasValue(item.value, tokensInProgress)
        }
      });
    }
    else {
      // If we're not dealing with special tokens, just return resolved value
      returnValue = getAliasValue(t, tokensInProgress);
      _failedToResolve = returnValue === null || checkIfContainsAlias(returnValue);
    }
    const { failedToResolve, ...objExcludeFailedToResolve } = t;
    const returnObject = {
      ...objExcludeFailedToResolve,
      value: returnValue,
      rawValue: t.rawValue || t.value,
      ...(_failedToResolve ? { failedToResolve: _failedToResolve } : {}),
    } as ResolveTokenValuesResult;

    return returnObject;
  });

  if (aliases.length > 0 && (previousCount > aliases.length || !previousCount)) {
    return resolveTokenValues(returnedTokens, aliases.length);
  }

  return returnedTokens;
}

export function mergeTokenGroups(tokens: Record<string, SingleToken[]>, usedSets: UsedTokenSetsMap = {}): SingleToken[] {
  const mergedTokens: SingleToken[] = [];
  // @README we will use both ENABLED and SOURCE sets
  // we only need to ignore the SOURCE sets when creating styles
  const tokenSetsToMerge = Object.entries(usedSets)
    .filter(([, status]) => status === TokenSetStatus.ENABLED || status === TokenSetStatus.SOURCE)
    .map(([tokenSet]) => tokenSet);

  // Reverse token set order (right-most win) and check for duplicates
  Object.entries(tokens)
    .reverse()
    .forEach((tokenGroup: [string, SingleToken[]]) => {
      if (tokenSetsToMerge.length === 0 || tokenSetsToMerge.includes(tokenGroup[0])) {
        tokenGroup[1].forEach((token) => {
          if (!mergedTokens.some((t) => t.name === token.name)) {
            mergedTokens.push({
              ...appendTypeToToken(token),
              internal__Parent: tokenGroup[0],
            } as SingleToken);
          }
        });
      }
    });
  return mergedTokens;
}
