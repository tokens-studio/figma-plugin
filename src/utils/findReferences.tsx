import { AliasDollarRegex, AliasRegex } from '@/constants/AliasRegex';

const OPENING_BRACE = '{';
const CLOSING_BRACE = '}';

export const findReferences = (tokenValue: string) => {
  const matches = tokenValue?.toString().match(AliasRegex);
  if (matches) {
    return matches.map((item) => {
      if (item.startsWith('{')) {
        return item.slice(1, item.length - 1);
      }
      return item.substring(1);
    });
  }
  return null;
};

export const findDollarReferences = (tokenValue: string) => tokenValue?.toString().match(AliasDollarRegex);

export const findMatchingReferences = (tokenValue: string, valueToLookFor: string) => {
  const references = findReferences(tokenValue);

  if (references) {
    return references.filter((ref) => {
      if (ref === valueToLookFor) return ref;
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
        newValue = newValue.replace(reference, newName);
      });
      return newValue;
    }
  } catch (e) {
    console.log('Error replacing reference', tokenValue, oldName, newName, e);
  }

  return tokenValue;
};

export const getRootReferences = (tokenValue: string) => {
  const array = [];
  let depth = 0;
  let startIndex = 0;
  for (let i = 0; i < tokenValue.length; i += 1) {
    if (tokenValue[i] === OPENING_BRACE) {
      if (depth === 0) {
        startIndex = i;
      }
      depth += 1;
    }
    if (tokenValue[i] === CLOSING_BRACE && depth > 0) {
      depth -= 1;
      if (depth === 0) {
        array.push(tokenValue.substring(startIndex, i + 1));
      }
    }
  }

  return array.concat(findDollarReferences(tokenValue) || []);
};
