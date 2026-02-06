import { SingleToken } from '@/types/tokens';
import { getParentPath, buildTokenName, getTokenBaseName } from './tokenPath';

/**
 * Check if moving a token to a new parent would cause a name collision
 * @param token - The token being moved
 * @param newParentPath - The target parent path (empty string for root)
 * @param allTokens - All tokens in the current token set
 * @returns true if the move would cause a collision, false otherwise
 */
export function wouldCauseNameCollision(
  token: SingleToken,
  newParentPath: string,
  allTokens: SingleToken[],
): boolean {
  const currentParent = getParentPath(token.name);

  // If moving to the same parent, no collision
  if (currentParent === newParentPath) {
    return false;
  }

  const baseName = getTokenBaseName(token.name);
  const newName = buildTokenName(baseName, newParentPath);

  // Check if any other token already has this name
  return allTokens.some((t) => t.name === newName && t.name !== token.name);
}

/**
 * Get the new name for a token when moving it to a new parent
 * @param token - The token being moved
 * @param newParentPath - The target parent path (empty string for root)
 * @returns The new token name
 */
export function getNewTokenName(token: SingleToken, newParentPath: string): string {
  const baseName = getTokenBaseName(token.name);
  return buildTokenName(baseName, newParentPath);
}
