import { AliasRegex } from '@/constants/AliasRegex';

export const findReferences = (tokenValue: string) => tokenValue?.toString().match(AliasRegex);

export const findMatchingReferences = (tokenValue: string, valueToLookFor: string) => {
  const references = findReferences(tokenValue);

  if (references) {
    return references.filter((ref) => {
      const name = ref.startsWith('{') ? ref.slice(1, ref.length - 1) : ref.substring(1);
      if (name === valueToLookFor) return ref;
      return false;
    });
  }
  return [];
};

export const replaceReferences = (tokenValue: string, oldName: string, newName: string) => {
  try {
    if (tokenValue.includes(oldName)) {
      const references = findMatchingReferences(tokenValue, oldName);
      let newValue = tokenValue;
      references.forEach((reference) => {
        newValue = newValue.replace(reference, `{${newName}}`);
      });
      return newValue;
    }
  } catch (e) {
    console.log('Error replacing reference', tokenValue, oldName, newName, e);
  }

  return tokenValue;
};
