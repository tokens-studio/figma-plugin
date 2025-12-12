import { AnyTokenList, SingleToken } from '@/types/tokens';

export enum ErrorType {
  UniqueToken = 'uniqueToken',
  EmptyGroupName = 'emptyGroupName',
  NoSetSelected = 'noSetSelected',
  ExistingGroup = 'existingGroup',
  OverlappingToken = 'overlappingToken',
  OverlappingGroup = 'overlappingGroup',
}

const getGroupName = (name) => {
  const nameParts = name.split('.');
  return nameParts.slice(0, -1).join('.');
};

const getRenamedChildGroups = (newPrefix, oldPrefix, tokens) => {
  const oldPrefixWithDot = `${oldPrefix}.`;
  const newPrefixWithDot = `${newPrefix}.`;

  // Create a set to store unique child groups
  const childGroups = new Set();

  tokens.forEach((token) => {
    if (token.name.startsWith(oldPrefixWithDot)) {
      const childGroup = getGroupName(token.name.replace(oldPrefixWithDot, newPrefixWithDot));
      childGroups.add(childGroup);
    }
  });

  return Array.from(childGroups);
};

export function validateRenameGroupName(tokensInParent, type, oldName, newName) {
  if (!newName) {
    return { type: ErrorType.EmptyGroupName };
  }
  const tokensToRename = tokensInParent
    .filter((token) => token.name.startsWith(oldName) && token.type === type)
    .map((filteredToken) => ({
      oldName: filteredToken.name,
      newName: filteredToken.name.replace(oldName, newName),
    }));

  const existingTokensAfterRename = tokensInParent.filter((token) => (
    !tokensToRename.some((t) => t.oldName === token.name)
  ));

  const renamedChildGroupNames = getRenamedChildGroups(newName, oldName, tokensInParent);
  const newTokensAfterRename = tokensInParent.map((token) => {
    // Find the renamed token, if it exists
    const renamedToken = tokensToRename.find((t) => t.oldName === token.name);
    if (renamedToken) {
      return { ...token, name: renamedToken.newName };
    }
    return token;
  });

  // Optimize duplicate detection: Use Map to count occurrences in O(n) instead of nested filter O(n²)
  const nameCounts = new Map<string, number>();
  newTokensAfterRename.forEach((token) => {
    nameCounts.set(token.name, (nameCounts.get(token.name) || 0) + 1);
  });

  // Create a Map for faster lookup of existing tokens
  const existingTokensMap = new Map<string, typeof existingTokensAfterRename[0]>();
  existingTokensAfterRename.forEach((token) => {
    const key = `${token.name}|${token.type}|${JSON.stringify(token.value)}`;
    existingTokensMap.set(key, token);
  });

  // Find duplicates that exist in both arrays
  const duplicatesMap = new Map<string, typeof newTokensAfterRename[0]>();
  newTokensAfterRename.forEach((token) => {
    if (nameCounts.get(token.name)! > 1) {
      const key = `${token.name}|${token.type}|${JSON.stringify(token.value)}`;
      if (existingTokensMap.has(key)) {
        duplicatesMap.set(token.name, token);
      }
    }
  });

  const possibleDuplicates = Array.from(duplicatesMap.values());

  const foundOverlappingTokens = (newName !== oldName) && tokensInParent.filter((token) => [newName, ...renamedChildGroupNames].includes(token.name));

  if (Object.keys(possibleDuplicates).length > 0) {
    return {
      possibleDuplicates,
      type: ErrorType.OverlappingGroup,
    };
  }
  if (foundOverlappingTokens?.length > 0) {
    return {
      type: ErrorType.OverlappingToken,
      foundOverlappingTokens,
    };
  }
  return null;
}

export function validateDuplicateGroupName(tokens, selectedTokenSets, activeTokenSet, type, oldName, newName): {
  type: ErrorType,
  possibleDuplicates?: { [key: string]: SingleToken[] },
  foundOverlappingTokens?: { [key: string]: SingleToken[] },
} | null {
  if (!newName) {
    return { type: ErrorType.EmptyGroupName };
  }
  if (!tokens[activeTokenSet]) {
    return null;
  }
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

      // Optimize duplicate detection: Use Map to count occurrences in O(n) instead of nested filter O(n²)
      const nameCounts = new Map<string, number>();
      newTokensAfterDuplicate.forEach((token) => {
        nameCounts.set(token.name, (nameCounts.get(token.name) || 0) + 1);
      });

      // Create a Map for faster lookup of existing tokens
      const existingTokensMap = new Map<string, typeof existingTokensAfterRename[0]>();
      existingTokensAfterRename.forEach((token) => {
        const key = `${token.name}|${token.type}|${JSON.stringify(token.value)}`;
        existingTokensMap.set(key, token);
      });

      // Find duplicates that exist in both arrays
      const duplicatesMap = new Map<string, typeof newTokensAfterDuplicate[0]>();
      newTokensAfterDuplicate.forEach((token) => {
        if (nameCounts.get(token.name)! > 1) {
          const key = `${token.name}|${token.type}|${JSON.stringify(token.value)}`;
          if (existingTokensMap.has(key)) {
            duplicatesMap.set(token.name, token);
          }
        }
      });

      const overlappingTokens = Array.from(duplicatesMap.values());
      if (overlappingTokens?.length > 0) {
        acc[setKey] = overlappingTokens;
      }
    }

    return acc;
  }, {});

  const foundOverlappingTokens: { [key: string]: SingleToken[] } = selectedTokenSets.reduce((acc, selectedTokenSet) => {
    const renamedChildGroupNames = getRenamedChildGroups(newName, oldName, tokens[selectedTokenSet]);
    const overlappingTokens = tokens[selectedTokenSet]?.filter((token) => [newName, ...renamedChildGroupNames].includes(token.name));
    if (overlappingTokens?.length > 0) {
      acc[selectedTokenSet] = overlappingTokens;
    }

    return acc;
  }, {});

  if (Object.keys(possibleDuplicates).length > 0) {
    return {
      possibleDuplicates,
      type: ErrorType.OverlappingGroup,
    };
  }
  if (Object.keys(foundOverlappingTokens).length > 0) {
    return {
      type: ErrorType.OverlappingToken,
      foundOverlappingTokens,
    };
  }
  return null;
}
