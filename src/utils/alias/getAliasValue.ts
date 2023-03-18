import { getRootReferences, findReferences } from '../findReferences';
import { ColorModifierTypes } from '@/constants/ColorModifierTypes';
import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '@/types/tokens';
import { TokenBorderValue, TokenBoxshadowValue, TokenTypographyValue } from '@/types/values';
import { convertToRgb } from '../color';
import { convertModifiedColorToHex } from '../convertModifiedColorToHex';

import { isSingleTokenValueObject } from '../is';
import { checkAndEvaluateMath } from '../math';
// eslint-disable-next-line import/no-cycle
import { checkIfAlias } from './checkIfAlias';

type TokenNameNodeType = string | undefined;

function getReturnedValue(token: SingleToken | string | number) {
  if (typeof token === 'object' && typeof token.value === 'object' && (token?.type === TokenTypes.BOX_SHADOW || token?.type === TokenTypes.TYPOGRAPHY || token?.type === TokenTypes.BORDER)) {
    return token.value;
  }
  if (isSingleTokenValueObject(token)) {
    return token.value.toString();
  }
  return token.toString();
}

function replaceAliasWithResolvedReference(
  token: string | TokenTypographyValue | TokenBoxshadowValue | TokenBoxshadowValue[] | TokenBorderValue | null,
  reference: string,
  resolvedReference: string | number | TokenBoxshadowValue | TokenBoxshadowValue[] | Record<string, unknown> | null,
) {
  if (typeof resolvedReference === 'object') {
    return resolvedReference;
  }
  if (token && (typeof token === 'string' || typeof token === 'number')) {
    const stringValue = String(resolvedReference);
    const resolved = checkAndEvaluateMath(stringValue);
    return token.replace(reference, String(resolved));
  }
  return token;
}

// @TODO This function logic needs to be explained to improve it. It is unclear at this time which cases it needs to handle and how
// when isResolved is true, we don't calculate the modifiers because it has been already resolved. previousCount prevents the multiple calculation of modifier
export function getAliasValue(token: SingleToken | string | number, tokens: SingleToken[] = [], isResolved: boolean = true, previousCount: number = 0): string | number | TokenTypographyValue | TokenBoxshadowValue | TokenBorderValue | Array<TokenBoxshadowValue> | null {
  // @TODO not sure how this will handle typography and boxShadow values. I don't believe it works.
  // The logic was copied from the original function in aliases.tsx
  let returnedValue: ReturnType<typeof getReturnedValue> | null = getReturnedValue(token);
  try {
    const tokenReferences = typeof returnedValue === 'string' ? getRootReferences(returnedValue) : null;

    if (tokenReferences?.length) {
      const resolvedReferences = Array.from(tokenReferences).map((ref) => {
        if (ref.length > 1) {
          let nameToLookFor: string;
          if (ref.startsWith('{')) {
            nameToLookFor = ref.slice(1, ref.length - 1);
          } else { nameToLookFor = ref.substring(1); }
          if (
            (typeof token === 'object' && nameToLookFor === token.name)
            || nameToLookFor === token
          ) {
            return isSingleTokenValueObject(token) ? token.value.toString() : token.toString();
          }
          const nameToLookForReferences = getRootReferences(nameToLookFor);
          if (nameToLookForReferences?.length) {
            nameToLookFor = String(getAliasValue(nameToLookFor, tokens, isResolved, previousCount));
          }

          const tokenAliasSplitted = nameToLookFor.split('.');
          const tokenAliasSplittedLast: TokenNameNodeType = tokenAliasSplitted.pop();
          const tokenAliasLastExcluded = tokenAliasSplitted.join('.');
          const tokenAliasSplittedLastPrevious: number = Number(tokenAliasSplitted.pop());
          const tokenAliasLastPreviousExcluded = tokenAliasSplitted.join('.');
          const foundToken = tokens.find((t) => t.name === nameToLookFor || t.name === tokenAliasLastExcluded || t.name === tokenAliasLastPreviousExcluded);

          if (foundToken?.name === nameToLookFor) {
            return getAliasValue(foundToken, tokens, isResolved, previousCount);
          }

          if (
            !!tokenAliasSplittedLast
            && foundToken?.name === tokenAliasLastExcluded
            && foundToken.value?.hasOwnProperty(tokenAliasSplittedLast)
          ) {
            const { value } = foundToken;
            if (typeof value === 'object' && !Array.isArray(value)) {
              const resolvedValue = value[tokenAliasSplittedLast as keyof typeof value] as string | number;
              return getAliasValue(resolvedValue, tokens, isResolved, previousCount);
            }
          }

          if (
            tokenAliasSplittedLastPrevious !== undefined
            && !!tokenAliasSplittedLast
            && foundToken?.name === tokenAliasLastPreviousExcluded
            && Array.isArray(foundToken?.rawValue)
            && !!foundToken?.rawValue[tokenAliasSplittedLastPrevious]
            && foundToken?.rawValue[tokenAliasSplittedLastPrevious].hasOwnProperty(tokenAliasSplittedLast)
          ) {
            const rawValueEntry = foundToken?.rawValue[tokenAliasSplittedLastPrevious];
            return getAliasValue(rawValueEntry[tokenAliasSplittedLast as keyof typeof rawValueEntry] || tokenAliasSplittedLastPrevious, tokens, isResolved, previousCount);
          }
        }
        return ref;
      });

      tokenReferences.forEach((reference, index) => {
        const resolvedReference = resolvedReferences[index];
        returnedValue = replaceAliasWithResolvedReference(returnedValue, reference, resolvedReference);
      });

      if (returnedValue === 'null') {
        returnedValue = null;
      }
    }
    if (returnedValue && typeof returnedValue === 'string') {
      const remainingReferences = findReferences(returnedValue);
      if (!remainingReferences) {
        const couldBeNumberValue = checkAndEvaluateMath(returnedValue);
        if (typeof couldBeNumberValue === 'number') return couldBeNumberValue;
        const rgbColor = convertToRgb(couldBeNumberValue);
        if (typeof token !== 'string' && typeof token !== 'number' && token?.$extensions?.['studio.tokens']?.modify && rgbColor && !isResolved && previousCount === 0) {
          if (token?.$extensions?.['studio.tokens']?.modify?.type === ColorModifierTypes.MIX && checkIfAlias(token?.$extensions?.['studio.tokens']?.modify?.color)) {
            return convertModifiedColorToHex(rgbColor, { ...token.$extensions?.['studio.tokens']?.modify, value: String(getAliasValue(token?.$extensions?.['studio.tokens']?.modify?.value, tokens)), color: String(getAliasValue(token?.$extensions?.['studio.tokens']?.modify?.color, tokens, isResolved, previousCount)) ?? '' });
          }
          return convertModifiedColorToHex(rgbColor, { ...token.$extensions?.['studio.tokens']?.modify, value: String(getAliasValue(token?.$extensions?.['studio.tokens']?.modify?.value, tokens, isResolved, previousCount)) });
        }
        return rgbColor;
      }
    }
  } catch (err) {
    console.log(`Error getting alias value of ${JSON.stringify(token, null, 2)}`, tokens);
    return null;
  }

  if (returnedValue && typeof returnedValue === 'string') {
    return checkAndEvaluateMath(returnedValue);
  }
  return returnedValue;
}
