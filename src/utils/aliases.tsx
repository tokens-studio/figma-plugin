import { checkAndEvaluateMath, convertToRgb } from '@/app/components/utils';
import { SingleToken } from '@/types/tokens';
import checkIfValueToken from './checkIfValueToken';
import { findReferences } from './findReferences';

export default function getAliasValue(token: SingleToken | string | number, tokens: SingleToken[] = []): string | null {
  let returnedValue = checkIfValueToken(token) ? (token.value as string) : (token as string);

  try {
    const tokenReferences = findReferences(returnedValue);

    if (tokenReferences?.length > 0) {
      const resolvedReferences = tokenReferences.map((ref) => {
        if (ref.length > 1) {
          const nameToLookFor = ref.startsWith('{') ? ref.slice(1, ref.length - 1) : ref.substring(1);

          if ((typeof token === 'object' && nameToLookFor === token.name) || nameToLookFor === token) return null;

          const foundToken = tokens.find((t) => t.name === nameToLookFor);
          if (typeof foundToken !== 'undefined') return getAliasValue(foundToken, tokens);
        }
        return ref;
      });
      tokenReferences.forEach((reference, index) => {
        const resolved = checkAndEvaluateMath(resolvedReferences[index]?.value ?? resolvedReferences[index]);
        returnedValue = returnedValue.replace(reference, resolved);
      });

      if (returnedValue === 'null') {
        returnedValue = null;
      }
    }
    if (typeof returnedValue !== 'undefined') {
      const remainingReferences = findReferences(returnedValue);

      if (!remainingReferences) {
        return convertToRgb(checkAndEvaluateMath(returnedValue));
      }
    }
  } catch (e) {
    console.log(`Error getting alias value of ${token}`, tokens);
    return null;
  }
  return checkAndEvaluateMath(returnedValue);
}
