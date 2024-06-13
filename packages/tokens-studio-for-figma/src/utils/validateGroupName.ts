import { AnyTokenList, SingleToken } from '@/types/tokens';

export enum ErrorType {
  UniqueToken = 'uniqueToken',
  NoSetSelected = 'noSetSelected',
  ExistingGroup = 'existingGroup',
  OverlappingToken = 'overlappingToken',
  OverlappingGroup = 'overlappingGroup',
}

export function validateRenameGroupName(tokensInParent, type, oldName, newName) {
  const tokensToRename = tokensInParent
    .filter((token) => token.name.startsWith(oldName) && token.type === type)
    .map((filteredToken) => ({
      oldName: filteredToken.name,
      newName: filteredToken.name.replace(oldName, newName),
    }));

  const existingTokensAfterRename = tokensInParent.filter((token) => (
    !tokensToRename.some((t) => t.oldName === token.name)
  ));

  const newTokensAfterRename = tokensInParent.map((token) => {
    // Find the renamed token, if it exists
    const renamedToken = tokensToRename.find((t) => t.oldName === token.name);
    if (renamedToken) {
      return { ...token, name: renamedToken.newName };
    }
    return token;
  });

  let possibleDuplicates = newTokensAfterRename.filter((a) => (newTokensAfterRename.filter((b) => a.name === b.name).length > 1) && existingTokensAfterRename.some((t) => t.name === a.name && t.type === a.type && t.value === a.value));
  possibleDuplicates = [...new Map(possibleDuplicates.map((item) => [item.name, item])).values()];

  const foundOverlappingToken = (newName !== oldName) && tokensInParent.find((token) => token.name === newName);

  if (Object.keys(possibleDuplicates).length > 0) {
    return {
      possibleDuplicates,
      type: ErrorType.OverlappingGroup,
    };
  }
  if (foundOverlappingToken) {
    return {
      type: ErrorType.OverlappingToken,
      foundOverlappingToken,
    };
  }
  return null;
}

export function validateDuplicateGroupName(tokens, selectedTokenSets, activeTokenSet, type, oldName, newName): {
  type: ErrorType,
  possibleDuplicates?: SingleToken[] | { [key: string]: SingleToken[] },
  foundOverlappingToken?: SingleToken | { [key: string]: SingleToken },
} | null {
  const selectedTokenGroup = tokens[activeTokenSet].filter((token) => (token.name.startsWith(`${oldName}.`) && token.type === type));
  const newTokenGroup = selectedTokenGroup.map((token) => {
    const { name, ...rest } = token;
    const duplicatedTokenGroupName = token.name.replace(oldName, newName);
    return {
      name: duplicatedTokenGroupName,
      ...rest,
    };
  });

  const newTokens = Object.keys(tokens).reduce<Record<string, AnyTokenList>>((acc, key) => {
    if (selectedTokenSets.includes(key)) {
      acc[key] = [...tokens[key], ...newTokenGroup];
    } else {
      acc[key] = tokens[key];
    }
    return acc;
  }, {});

  const possibleDuplicates = Object.keys(newTokens).reduce((acc, setKey) => {
    if (selectedTokenSets.includes(setKey)) {
      const newTokensAfterDuplicate = newTokens[setKey];
      const existingTokensAfterRename = tokens[setKey];

      let overlappingTokens = newTokensAfterDuplicate.filter((a) => (newTokensAfterDuplicate.filter((b) => a.name === b.name).length > 1) && existingTokensAfterRename.some((t) => t.name === a.name && t.type === a.type && t.value === a.value));
      overlappingTokens = [...new Map(overlappingTokens?.map((item) => [item.name, item])).values()];
      if (overlappingTokens?.length > 0) {
        acc[setKey] = overlappingTokens;
      }
    }

    return acc;
  }, {});

  const foundOverlappingToken: { [key: string]: SingleToken } = selectedTokenSets.reduce((acc, selectedTokenSet) => {
    const overlappingToken = tokens[selectedTokenSet].find((token) => token.name === newName);
    if (overlappingToken) {
      acc[selectedTokenSet] = overlappingToken;
    }

    return acc;
  }, {});

  if (Object.keys(possibleDuplicates).length > 0) {
    return {
      possibleDuplicates,
      type: ErrorType.OverlappingGroup,
    };
  }
  if (Object.keys(foundOverlappingToken).length > 0) {
    return {
      type: ErrorType.OverlappingToken,
      foundOverlappingToken,
    };
  }
  return null;
}
