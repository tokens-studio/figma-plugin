import omit from 'just-omit';
import { appendTypeToToken } from '@/app/components/createTokenObj';
import { SingleToken } from '@/types/tokens';
import { checkIfAlias, checkIfContainsAlias, getAliasValue } from '@/utils/alias';
import { isSingleToken } from '@/utils/is';
import { TokenTypes } from '@/constants/TokenTypes';
import { UsedTokenSetsMap } from '@/types';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { TokenBoxshadowValue } from '@/types/values';
import { CompositionTokenProperty, CompositionTokenValue } from '@/types/CompositionTokenProperty';

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

    let failedToResolve = false;
    // Iterate over Typography and boxShadow Object to get resolved values
    if (t.type === TokenTypes.TYPOGRAPHY || t.type === TokenTypes.BOX_SHADOW) {
      // If value is alias
      if (typeof t.value === 'string') {
        returnValue = getAliasValue(t.value, tokensInProgress);
        failedToResolve = returnValue === null || checkIfContainsAlias(typeof returnValue === 'string' ? returnValue : '');
      } else if (Array.isArray(t.value)) {
        // If we're dealing with an array, iterate over each item and then key
        returnValue = t.value.map((item) => (
          Object.entries(item).reduce<Record<string, ReturnType<typeof getAliasValue>>>((acc, [key, value]) => {
            acc[key] = getAliasValue(value, tokensInProgress);
            const itemFailedToResolve = acc[key] === null || checkIfContainsAlias(typeof acc[key] === 'string' ? acc[key] as string : '');
            if (itemFailedToResolve) {
              failedToResolve = true;
            }
            return acc;
          }, {})
        ));
        // If not, iterate over each key
      } else {
        returnValue = Object.entries(t.value).reduce<Record<string, ReturnType<typeof getAliasValue>>>((acc, [key, value]) => {
          acc[key] = getAliasValue(value, tokensInProgress);
          const itemFailedToResolve = acc[key] === null || checkIfContainsAlias(typeof acc[key] === 'string' ? acc[key] as string : '');
          if (itemFailedToResolve) {
            failedToResolve = true;
          }
          return acc;
        }, {});
      }
    } else if (t.type === TokenTypes.COMPOSITION) {
      let itemFailedToResolve = false;
      const compositionReturnValue: CompositionTokenValue = {};
      Object.entries(t.value).forEach(([property, value]) => {
        if (Array.isArray(value)) {
          const resolvedValue = value.map((item) => (
            Object.entries(item as TokenBoxshadowValue).reduce<Record<string, ReturnType<typeof getAliasValue>>>((acc, [key, value]) => {
              acc[key] = getAliasValue(value, tokensInProgress);
              itemFailedToResolve = acc[key] === null || checkIfContainsAlias(acc[key]);
              if (itemFailedToResolve) {
                failedToResolve = true;
              }
              return acc;
            }, {}) as TokenBoxshadowValue
          ));
          compositionReturnValue[property as CompositionTokenProperty] = resolvedValue;
        } else if (typeof value === 'object') {
          const resolvedValue = Object.entries(value).reduce<Record<string, ReturnType<typeof getAliasValue>>>((acc, [key, value]) => {
            acc[key] = getAliasValue(value, tokensInProgress);
            itemFailedToResolve = acc[key] === null || checkIfContainsAlias(acc[key]);
            if (itemFailedToResolve) {
              failedToResolve = true;
            }
            return acc;
          }, {});
          compositionReturnValue[property as CompositionTokenProperty] = resolvedValue;
        } else {
          const resolvedValue = getAliasValue(value, tokensInProgress);
          if (resolvedValue !== null) {
            compositionReturnValue[property as CompositionTokenProperty] = resolvedValue;
          }
          itemFailedToResolve = resolvedValue === null || checkIfContainsAlias(resolvedValue);
          if (itemFailedToResolve) {
            failedToResolve = true;
          }
        }
      });
      returnValue = compositionReturnValue;
    } else {
      // If we're not dealing with special tokens, just return resolved value
      returnValue = getAliasValue(t, tokensInProgress);
      failedToResolve = returnValue === null || checkIfContainsAlias(typeof returnValue === 'string' ? returnValue : '');
    }
    const returnObject = {
      ...omit(t, 'failedToResolve'),
      value: returnValue,
      rawValue: t.rawValue || t.value,
      ...(failedToResolve ? { failedToResolve } : {}),
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

  const tokenSetOrder = tokens?.$metadata?.map(({ value }) => value);

  const tokenEntries = tokenSetOrder ? Object.entries(tokens)
    .sort((a, b) => tokenSetOrder.indexOf(a[0]) - tokenSetOrder.indexOf(b[0])) : Object.entries(tokens);

  // Reverse token set order (right-most win) and check for duplicates
  tokenEntries
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
