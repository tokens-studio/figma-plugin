import omit from 'just-omit';
import { appendTypeToToken } from '@/app/components/createTokenObj';
import { SingleToken } from '@/types/tokens';
import { checkIfAlias, checkIfContainsAlias, getAliasValue } from '@/utils/alias';
import { isSingleToken } from '@/utils/is';
import { TokenTypes } from '@/constants/TokenTypes';
import { UsedTokenSetsMap } from '@/types';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { TokenBoxshadowValue } from '@/types/values';

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
    let itemFailedToResolve = false;
    // Iterate over Typography and boxShadow Object to get resolved values
    if (t.type === TokenTypes.TYPOGRAPHY || t.type === TokenTypes.BOX_SHADOW) {
      // If value is alias
      if (typeof t.value === 'string') {
        returnValue = getAliasValue(t.value, tokensInProgress);
        failedToResolve = returnValue === null || checkIfContainsAlias(returnValue);
      } else if (Array.isArray(t.value)) {
        // If we're dealing with an array, iterate over each item and then key
        returnValue = t.value.map((item) => (
          Object.entries(item).reduce<Record<string, ReturnType<typeof getAliasValue>>>((acc, [key, value]) => {
            acc[key] = getAliasValue(value, tokensInProgress);
            itemFailedToResolve = acc[key] === null || checkIfContainsAlias(acc[key]);
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
          itemFailedToResolve = acc[key] === null || checkIfContainsAlias(acc[key]);
          if (itemFailedToResolve) {
            failedToResolve = true;
          }
          return acc;
        }, {});
      }
    }
    else if (t.type === TokenTypes.COMPOSITION) {
      let returnItemValue:
        Record<string, ReturnType<typeof getAliasValue>>[] |
        Record<string, ReturnType<typeof getAliasValue>> |
        ReturnType<typeof getAliasValue>;
      if (Array.isArray(t.value)) {
        returnValue = t.value.map((item) => {
          if (checkIfContainsAlias(item.value)) {
            returnItemValue = getAliasValue(item.value, tokensInProgress);
            itemFailedToResolve = returnItemValue === null || checkIfContainsAlias(returnItemValue);
            if (itemFailedToResolve) {
              failedToResolve = true;
            }
            return {
              property: item.property,
              value: returnItemValue
            };
          }
          else if (item.property === TokenTypes.BOX_SHADOW || item.property === TokenTypes.TYPOGRAPHY) {
            if (Array.isArray(item.value)) {
              returnItemValue = item.value.map((item) => (
                Object.entries(item as TokenBoxshadowValue).reduce<Record<string, ReturnType<typeof getAliasValue>>>((acc, [key, value]) => {
                  acc[key] = getAliasValue(value, tokensInProgress);
                  itemFailedToResolve = acc[key] === null || checkIfContainsAlias(acc[key]);
                  if (itemFailedToResolve) {
                    failedToResolve = true;
                  }
                  return acc;
                }, {})
              ));
              return {
                property: item.property,
                value: returnItemValue
              };
            } else {
              returnItemValue = Object.entries(item.value).reduce<Record<string, ReturnType<typeof getAliasValue>>>((acc, [key, value]) => {
                acc[key] = getAliasValue(value, tokensInProgress);
                itemFailedToResolve = acc[key] === null || checkIfContainsAlias(acc[key]);
                if (itemFailedToResolve) {
                  failedToResolve = true;
                }
                return acc;
              }, {});
              return {
                property: item.property,
                value: returnItemValue
              };
            }
          } else {
            returnItemValue = getAliasValue(item.value, tokensInProgress);
            failedToResolve = returnItemValue === null || checkIfContainsAlias(returnItemValue);
            return {
              property: item.property,
              value: returnItemValue
            };
          }
        });
      } else {
        if (checkIfContainsAlias(t.value.value)) {
          returnItemValue = getAliasValue(t.value.value, tokensInProgress);
          failedToResolve = returnItemValue === null || checkIfContainsAlias(returnItemValue);
          returnValue = {
            property: t.value.property,
            value: returnItemValue
          };
        }
        else if (t.value.property === TokenTypes.BOX_SHADOW || t.value.property === TokenTypes.TYPOGRAPHY) {
          if (Array.isArray(t.value.value)) {
            returnItemValue = t.value.value.map((item) => (
              Object.entries(item as TokenBoxshadowValue).reduce<Record<string, ReturnType<typeof getAliasValue>>>((acc, [key, value]) => {
                acc[key] = getAliasValue(value, tokensInProgress);
                itemFailedToResolve = acc[key] === null || checkIfContainsAlias(acc[key]);
                if (itemFailedToResolve) {
                  failedToResolve = true;
                }
                return acc;
              }, {})
            ));
            returnValue = {
              property: t.value.property,
              value: returnItemValue
            };
          } else {
            returnItemValue = Object.entries(t.value.value).reduce<Record<string, ReturnType<typeof getAliasValue>>>((acc, [key, value]) => {
              acc[key] = getAliasValue(value, tokensInProgress);
              itemFailedToResolve = acc[key] === null || checkIfContainsAlias(acc[key]);
              if (itemFailedToResolve) {
                failedToResolve = true;
              }
              return acc;
            }, {});
            returnValue = {
              property: t.value.property,
              value: returnItemValue
            };
          }
        } else {
          returnItemValue = getAliasValue(t.value.value, tokensInProgress);
          failedToResolve = returnItemValue === null || checkIfContainsAlias(returnItemValue);
          returnValue = {
            property: t.value.property,
            value: returnItemValue
          };
        }
      }
    }
    else {
      // If we're not dealing with special tokens, just return resolved value
      returnValue = getAliasValue(t, tokensInProgress);
      failedToResolve = returnValue === null || checkIfContainsAlias(returnValue);
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
