import { forIn } from 'lodash';
import { SingleToken } from '@/types/tokens';
import { convertToRgb } from '../color';
import { findReferences } from '../findReferences';
import { isSingleTokenValueObject } from '../is';
import { checkAndEvaluateMath } from '../math';

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
          const nameToLookFor = ref.startsWith('{') ? ref.slice(1, ref.length - 1) : ref.substring(1);
          // exclude references to  self
          if ((typeof token === 'object' && nameToLookFor === token.name) || nameToLookFor === token) return null;
          const splitedArray = nameToLookFor.split('.');
          let candidateToken = '';
          for (let index = 0; index < splitedArray.length - 2; index++) {
            candidateToken += splitedArray[index];
            candidateToken += '.';
          }
          candidateToken += splitedArray[splitedArray.length - 2];
          const foundToken = tokens.find((t) => t.name === nameToLookFor || t.name === candidateToken);
          if (foundToken?.name === nameToLookFor) {
            return getAliasValue(foundToken, tokens);
          }
          if (foundToken?.name === candidateToken) {
            const candidateProperty = splitedArray[splitedArray.length - 1];
            if (foundToken.rawValue?.hasOwnProperty(candidateProperty)) {
              return foundToken.rawValue[candidateProperty];
            }
          }
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
