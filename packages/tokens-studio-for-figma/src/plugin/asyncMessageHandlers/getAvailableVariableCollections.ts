import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import type { VariableCollectionInfo } from '@/types/VariableCollectionSelection';

/**
 * Calculate extension depth for a collection
 * @param collectionId - ID of the collection to check
 * @param collectionsMap - Map of all collections by ID
 * @returns Depth (0 = regular, 1 = first level extension, 2+ = multi-level)
 */
function calculateExtensionDepth(
  collectionId: string,
  collectionsMap: Map<string, any>,
): number {
  const collection = collectionsMap.get(collectionId);
  if (!collection?.isExtension || !collection.parentVariableCollectionId) {
    return 0; // Regular collection
  }

  // Recursive: depth = 1 + parent's depth
  return 1 + calculateExtensionDepth(collection.parentVariableCollectionId, collectionsMap);
}

export const getAvailableVariableCollections: AsyncMessageChannelHandlers[AsyncMessageTypes.GET_AVAILABLE_VARIABLE_COLLECTIONS] = async (): Promise<{
  collections: VariableCollectionInfo[]
}> => {
  try {
    const allCollections = await figma.variables.getLocalVariableCollectionsAsync();

    // Create a map for quick lookup during depth calculation
    const collectionsMap = new Map<string, any>();
    allCollections.forEach((collection) => {
      const extendedCollection = collection as any;
      collectionsMap.set(collection.id, extendedCollection);
    });

    const collections: VariableCollectionInfo[] = allCollections.map((collection) => {
      // Type assertion for extended collection properties not yet in Figma type definitions
      const extendedCollection = collection as any;
      return {
        id: collection.id,
        name: collection.name || `Collection ${collection.id.slice(0, 8)}`,
        isExtension: extendedCollection.isExtension || false,
        parentCollectionId: extendedCollection.isExtension
          ? extendedCollection.parentVariableCollectionId
          : undefined,
        extensionDepth: calculateExtensionDepth(collection.id, collectionsMap),
        modes: collection.modes.map((mode) => ({
          modeId: mode.modeId,
          name: mode.name || `Mode ${mode.modeId.slice(0, 8)}`,
          parentModeId: (mode as any).parentModeId, // For extended collections
        })),
      };
    });

    return { collections };
  } catch (error) {
    console.error('Error getting variable collections:', error);
    return { collections: [] };
  }
};
