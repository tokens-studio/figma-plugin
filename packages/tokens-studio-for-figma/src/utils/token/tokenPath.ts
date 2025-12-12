/**
 * Utilities for working with token paths and names
 */

/**
 * Get the parent path of a token name
 * @example getParentPath('size.font.small') => 'size.font'
 * @example getParentPath('size') => ''
 */
export function getParentPath(tokenName: string): string {
  const parts = tokenName.split('.');
  if (parts.length <= 1) return '';
  return parts.slice(0, -1).join('.');
}

/**
 * Get the token name without its parent path
 * @example getTokenBaseName('size.font.small') => 'small'
 */
export function getTokenBaseName(tokenName: string): string {
  const parts = tokenName.split('.');
  return parts[parts.length - 1];
}

/**
 * Check if a token is in a specific group
 * @example isInGroup('size.font.small', 'size.font') => true
 * @example isInGroup('size.font.small', 'size') => true (parent of parent)
 * @example isInGroup('size.font.small', 'color') => false
 */
export function isInGroup(tokenName: string, groupPath: string): boolean {
  if (!groupPath) return true; // Empty group path means root level
  return tokenName.startsWith(`${groupPath}.`);
}

/**
 * Build a new token name with a different parent path
 * @example buildTokenName('small', 'size.font') => 'size.font.small'
 * @example buildTokenName('small', '') => 'small'
 */
export function buildTokenName(baseName: string, parentPath: string): string {
  if (!parentPath) return baseName;
  return `${parentPath}.${baseName}`;
}

/**
 * Get the depth level of a token path
 * @example getPathDepth('size.font.small') => 3
 * @example getPathDepth('size') => 1
 */
export function getPathDepth(tokenName: string): number {
  return tokenName.split('.').length;
}

/**
 * Check if two tokens are in the same parent group
 * @example areSiblings('size.font.small', 'size.font.big') => true
 * @example areSiblings('size.font.small', 'size.spacing.small') => false
 */
export function areSiblings(tokenName1: string, tokenName2: string): boolean {
  return getParentPath(tokenName1) === getParentPath(tokenName2);
}
