import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '@/types/tokens';
import { TokenBoxshadowValue, TokenTypograpyValue } from '@/types/values';
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

function replaceAliasWithResolvedReference(token: string | TokenTypograpyValue | TokenBoxshadowValue | TokenBoxshadowValue[] | null, reference: string, resolvedReference: string | number | object | null) {
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
export function getAliasValue(token: SingleToken | string | number, tokens: SingleToken[] = []): string | number | object | null {
  // @TODO not sure how this will handle typography and boxShadow values. I don't believe it works.
  // The logic was copied from the original function in aliases.tsx

  let returnedValue: string | TokenTypograpyValue | TokenBoxshadowValue | TokenBoxshadowValue[] | null = getReturnedValue(token);

  try {
    const tokenReferences = findReferences(returnedValue);

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

          const tokenAliasSplited = nameToLookFor.split('.');
          const tokenAliasSplitedLast: TokenNameNodeType = tokenAliasSplited.pop();
          const tokenAliasLastExcluded = tokenAliasSplited.join('.');
          const tokenAliasSplitedLastPrevious: number = Number(tokenAliasSplited.pop());
          const tokenAliasLastPreviousExcluded = tokenAliasSplited.join('.');
          const foundToken = tokens.find((t) => t.name === nameToLookFor || t.name === tokenAliasLastExcluded || t.name === tokenAliasLastPreviousExcluded);

          if (foundToken?.name === nameToLookFor) { return getAliasValue(foundToken, tokens); }

          if (
            !!tokenAliasSplitedLast
            && foundToken?.name === tokenAliasLastExcluded
            && foundToken.rawValue?.hasOwnProperty(tokenAliasSplitedLast)
          ) { return getAliasValue(foundToken?.rawValue[tokenAliasSplitedLast], tokens); }

          if (
            tokenAliasSplitedLastPrevious !== undefined
            && !!tokenAliasSplitedLast
            && foundToken?.name === tokenAliasLastPreviousExcluded
            && Array.isArray(foundToken?.rawValue)
            && !!foundToken?.rawValue[tokenAliasSplitedLastPrevious]
            && foundToken?.rawValue[tokenAliasSplitedLastPrevious].hasOwnProperty(tokenAliasSplitedLast)
          ) { return getAliasValue(foundToken?.rawValue[tokenAliasSplitedLastPrevious][tokenAliasSplitedLast], tokens); }
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

    if (returnedValue) {
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
