import { AnyTokenList, SingleToken, TokenToRename } from '@/types/tokens';

/**
 * Detects token renames by comparing before and after token states.
 * Returns a list of potential renames based on matching token values and types
 * but different names.
 */
export function detectTokenRenames(
  beforeTokens: Record<string, AnyTokenList>,
  afterTokens: Record<string, AnyTokenList>,
): TokenToRename[] {
  const renames: TokenToRename[] = [];
  const processedAfterTokens = new Set<string>();

  // For each token set, compare before and after
  Object.entries(beforeTokens).forEach(([setName, beforeTokenList]) => {
    const afterTokenList = afterTokens[setName];
    if (!afterTokenList) return;

    // Create maps for efficient lookup
    const beforeTokenMap = new Map<string, SingleToken>();
    const afterTokenMap = new Map<string, SingleToken>();
    
    beforeTokenList.forEach((token) => {
      beforeTokenMap.set(token.name, token);
    });
    
    afterTokenList.forEach((token) => {
      afterTokenMap.set(token.name, token);
    });

    // Find tokens that exist in before but not in after (potential renames)
    beforeTokenList.forEach((beforeToken) => {
      if (!afterTokenMap.has(beforeToken.name)) {
        // This token was removed, look for a matching token in after with same value/type
        const matchingAfterToken = afterTokenList.find((afterToken) => {
          const fullAfterTokenName = `${setName}.${afterToken.name}`;
          return (
            !beforeTokenMap.has(afterToken.name) && // New token name
            !processedAfterTokens.has(fullAfterTokenName) && // Not already matched
            isSameToken(beforeToken, afterToken) // Same value and type
          );
        });

        if (matchingAfterToken) {
          const oldName = `${setName}.${beforeToken.name}`;
          const newName = `${setName}.${matchingAfterToken.name}`;
          
          renames.push({
            oldName,
            newName,
          });
          
          processedAfterTokens.add(`${setName}.${matchingAfterToken.name}`);
        }
      }
    });
  });

  return renames;
}

/**
 * Checks if two tokens are the same based on their value and type.
 * Used to identify potential renames.
 */
function isSameToken(token1: SingleToken, token2: SingleToken): boolean {
  // Compare type
  if (token1.type !== token2.type) {
    return false;
  }

  // Compare value (deep comparison for objects/arrays)
  try {
    const value1 = JSON.stringify(token1.value);
    const value2 = JSON.stringify(token2.value);
    if (value1 !== value2) {
      return false;
    }
  } catch {
    // Fallback to simple comparison if JSON.stringify fails
    if (token1.value !== token2.value) {
      return false;
    }
  }

  // Compare description if both have it
  if (token1.description && token2.description) {
    return token1.description === token2.description;
  }

  // If only one has a description, they might still be the same token
  // but if both have different descriptions, they're likely different
  if (token1.description && token2.description && token1.description !== token2.description) {
    return false;
  }

  return true;
}