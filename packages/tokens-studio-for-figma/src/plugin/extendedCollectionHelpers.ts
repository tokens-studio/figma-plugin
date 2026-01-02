/**
 * Helper utilities for working with Figma Extended Variable Collections.
 * These are pure runtime functions that handle API quirks and provide safe accessors.
 */

/**
 * Safely gets the parent variable collection ID from a collection.
 * Handles the prototype property case where parentVariableCollectionId
 * may not be an enumerable own-property.
 * 
 * @param collection - A Figma VariableCollection
 * @returns The parent collection ID if extended, undefined otherwise
 */
export function getParentVariableCollectionId(
  collection: VariableCollection
): string | undefined {
  // Check if the property exists (on prototype or own property)
  if ('parentVariableCollectionId' in collection) {
    const parentId = collection.parentVariableCollectionId;
    // Ensure it's a string (not null or undefined)
    return typeof parentId === 'string' ? parentId : undefined;
  }
  return undefined;
}

/**
 * Checks if a collection is an extended variable collection.
 * 
 * @param collection - A Figma VariableCollection
 * @returns true if the collection extends a parent collection
 */
export function isExtendedCollection(collection: VariableCollection): boolean {
  const parentId = getParentVariableCollectionId(collection);
  return parentId !== undefined && parentId.length > 0;
}

/**
 * Safely gets the variable IDs from a collection.
 * Handles the case where variableIds might be a getter on the prototype
 * rather than an enumerable own-property.
 * 
 * @param collection - A Figma VariableCollection
 * @returns Array of variable IDs, or empty array if not accessible
 */
export function getCollectionVariableIds(collection: VariableCollection): string[] {
  // Check if variableIds exists and is an array (getter or own property)
  if ('variableIds' in collection && Array.isArray(collection.variableIds)) {
    console.log('[DEBUG getCollectionVariableIds] Found variableIds via in check, count:', collection.variableIds.length);
    return collection.variableIds;
  }
  // Try direct access as fallback (for getter properties)
  try {
    const ids = collection.variableIds;
    if (Array.isArray(ids)) {
      console.log('[DEBUG getCollectionVariableIds] Found variableIds via direct access, count:', ids.length);
      return ids;
    }
  } catch (e) {
    console.log('[DEBUG getCollectionVariableIds] Property access failed:', e);
  }
  console.log('[DEBUG getCollectionVariableIds] No variableIds found for collection:', collection.name);
  return [];
}
