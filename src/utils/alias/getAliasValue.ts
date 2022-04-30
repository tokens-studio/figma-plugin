import { SingleToken } from '@/types/tokens';
import { convertToRgb } from '../color';
import { findReferences } from '../findReferences';
import { isSingleTokenValueObject } from '../is';
import { checkAndEvaluateMath } from '../math';

type TokenNameNodeType = string | undefined;

// @TODO This function logic needs to be explained to improve it. It is unclear at this time which cases it needs to handle and how
export function getAliasValue(token: SingleToken | string | number, tokens: SingleToken[] = []): string | number | null {
  // @TODO not sure how this will handle typography and boxShadow values. I don't believe it works.
  // The logic was copied from the original function in aliases.tsx
  let returnedValue: string | null = isSingleTokenValueObject(token) ? token.value.toString() : token.toString();
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
          ) { return null; }

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
        const stringValue = String(resolvedReference);
        const resolved = checkAndEvaluateMath(stringValue);
        returnedValue = returnedValue ? returnedValue.replace(reference, String(resolved)) : returnedValue;
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

  if (returnedValue) {
    return checkAndEvaluateMath(returnedValue);
  }
  return returnedValue;
}
