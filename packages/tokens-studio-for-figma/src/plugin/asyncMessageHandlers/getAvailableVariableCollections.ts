import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import type { VariableCollectionInfo } from '@/types/VariableCollectionSelection';

export const getAvailableVariableCollections: AsyncMessageChannelHandlers[AsyncMessageTypes.GET_AVAILABLE_VARIABLE_COLLECTIONS] = async (): Promise<{
  collections: VariableCollectionInfo[]
}> => {
  try {
    const allCollections = await figma.variables.getLocalVariableCollectionsAsync();

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
