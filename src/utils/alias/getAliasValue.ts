import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '@/types/tokens';
import { TokenBoxshadowValue, TokenTypographyValue } from '@/types/values';
import { convertToRgb } from '../color';
import { findReferences } from '../findReferences';
import { isSingleTokenValueObject } from '../is';
import { checkAndEvaluateMath } from '../math';

type TokenNameNodeType = string | undefined;

function getReturnedValue(token: SingleToken | string | number) {
  if (typeof token === 'object' && typeof token.value === 'object' && (token?.type === TokenTypes.BOX_SHADOW || token?.type === TokenTypes.TYPOGRAPHY)) {
    return token.value;
  }
  if (isSingleTokenValueObject(token)) {
    return token.value.toString();
  }
  return token.toString();
}

function replaceAliasWithResolvedReference(
  token: string | TokenTypographyValue | TokenBoxshadowValue | TokenBoxshadowValue[] | null,
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
export function getAliasValue(token: SingleToken | string | number, tokens: SingleToken[] = []): string | number | TokenTypographyValue | TokenBoxshadowValue | Array<TokenBoxshadowValue> | null {
  // @TODO not sure how this will handle typography and boxShadow values. I don't believe it works.
  // The logic was copied from the original function in aliases.tsx
  let returnedValue: ReturnType<typeof getReturnedValue> | null = getReturnedValue(token);
  try {
    const tokenReferences = typeof returnedValue === 'string' ? findReferences(returnedValue) : null;

    if (tokenReferences?.length) {
      const resolvedReferences = Array.from(tokenReferences).map((ref) => {
        if (ref.length > 1) {
          let nameToLookFor: string;
          if (ref.startsWith('{')) {
            if (ref.endsWith('}')) nameToLookFor = ref.slice(1, ref.length - 1);
            else nameToLookFor = ref.slice(1, ref.length);
          } else { nameToLookFor = ref.substring(1); }

          if (
            (typeof token === 'object' && nameToLookFor === token.name)
            || nameToLookFor === token
          ) {
            return isSingleTokenValueObject(token) ? token.value.toString() : token.toString();
          }

          const tokenAliasSplitted = nameToLookFor.split('.');
          const tokenAliasSplittedLast: TokenNameNodeType = tokenAliasSplitted.pop();
          const tokenAliasLastExcluded = tokenAliasSplitted.join('.');
          const tokenAliasSplittedLastPrevious: number = Number(tokenAliasSplitted.pop());
          const tokenAliasLastPreviousExcluded = tokenAliasSplitted.join('.');
          const foundToken = tokens.find((t) => t.name === nameToLookFor || t.name === tokenAliasLastExcluded || t.name === tokenAliasLastPreviousExcluded);

          if (foundToken?.name === nameToLookFor) { return getAliasValue(foundToken, tokens); }

          if (
            !!tokenAliasSplittedLast
            && foundToken?.name === tokenAliasLastExcluded
            && foundToken.rawValue?.hasOwnProperty(tokenAliasSplittedLast)
          ) {
            const { rawValue } = foundToken;
            if (typeof rawValue === 'object' && !Array.isArray(rawValue)) {
              const value = rawValue[tokenAliasSplittedLast as keyof typeof rawValue] as string | number;
              return getAliasValue(value, tokens);
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
            return getAliasValue(rawValueEntry[tokenAliasSplittedLast as keyof typeof rawValueEntry] || tokenAliasSplittedLastPrevious, tokens);
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
        return convertToRgb(couldBeNumberValue);
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
