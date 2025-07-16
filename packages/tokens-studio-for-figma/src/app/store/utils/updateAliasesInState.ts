import { AnyTokenList, SingleToken, TokenToRename } from '@/types/tokens';
import { replaceReferences } from '@/utils/findReferences';
import { TokenState } from '../models/tokenState';
import { updateModify } from './updateModify';

// Helper function to replace references while preserving original types
function replaceReferencesPreservingType(value: string | number, oldName: string, newName: string): string | number {
  // Only convert to string if we actually need to do reference replacement
  if (typeof value === 'string') {
    return replaceReferences(value, oldName, newName);
  }

  // For numbers, only convert to string if they contain references (which is unlikely but possible in edge cases)
  const stringValue = value.toString();
  const newValue = replaceReferences(stringValue, oldName, newName);

  // If no change occurred, return the original number
  if (newValue === stringValue) {
    return value;
  }

  // If change occurred, try to convert back to number if possible
  const numberValue = Number(newValue);
  if (!isNaN(numberValue) && newValue === numberValue.toString()) {
    return numberValue;
  }

  // Otherwise return the string
  return newValue;
}

export function updateAliasesInState(tokens: Record<string, AnyTokenList>, data: TokenToRename) {
  const updatedSets: string[] = [];
  const updatedTokens = Object.entries(tokens).reduce<TokenState['tokens']>(
    (acc, [key, values]) => {
      const newValues = values.map<SingleToken>((token) => {
        try {
        // Update references inside modify
          const newToken = updateModify(token, data);
          // check if $extensions was updated
          if (JSON.stringify(newToken.$extensions) !== JSON.stringify(token.$extensions)) {
            if (!updatedSets.includes(key)) updatedSets.push(key);
          }

          // Update if token is of type array, e.g. box shadows
          if (Array.isArray(newToken.value)) {
            const newTokenValue = newToken.value.map((t) => Object.entries(t).reduce<Record<string, string | number>>((a, [k, v]) => {
              a[k] = replaceReferencesPreservingType(v as string | number, data.oldName, data.newName);
              return a;
            }, {}));

            if (JSON.stringify(newTokenValue) !== JSON.stringify(newToken.value)) {
              if (!updatedSets.includes(key)) updatedSets.push(key);
            }

            return {
              ...newToken,
              value: newTokenValue,
            } as SingleToken;
          }

          // Update if we have a composite token value, e.g. typography
          if (typeof newToken.value === 'object') {
            const newTokenValue = Object.entries(newToken.value).reduce<Record<string, string | number>>((a, [k, v]) => {
              a[k] = replaceReferencesPreservingType(v as string | number, data.oldName, data.newName);
              return a;
            }, {});

            if (JSON.stringify(newTokenValue) !== JSON.stringify(newToken.value)) {
              if (!updatedSets.includes(key)) updatedSets.push(key);
            }

            return {
              ...newToken,
              value: newTokenValue,
            } as SingleToken;
          }

          const newValue = replaceReferencesPreservingType(newToken.value as string | number, data.oldName, data.newName);
          if (newValue !== newToken.value) {
            if (!updatedSets.includes(key)) updatedSets.push(key);
          }

          // Update for remaining token value types
          return {
            ...newToken,
            value: newValue,
          } as SingleToken;
        } catch (e) {
          console.error(e);
          return token;
        }
      });

      acc[key] = newValues;
      return acc;
    },
    {},
  );
  return { updatedTokens, updatedSets };
}
