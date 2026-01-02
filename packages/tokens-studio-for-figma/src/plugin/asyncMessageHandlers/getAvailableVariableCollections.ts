import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import type { VariableCollectionInfo } from '@/types/VariableCollectionSelection';
import { getParentVariableCollectionId, isExtendedCollection } from '../extendedCollectionHelpers';

export const getAvailableVariableCollections: AsyncMessageChannelHandlers[AsyncMessageTypes.GET_AVAILABLE_VARIABLE_COLLECTIONS] = async (): Promise<{
  collections: VariableCollectionInfo[]
}> => {
  try {
    const allCollections = await figma.variables.getLocalVariableCollectionsAsync();

    const collections: VariableCollectionInfo[] = allCollections.map((collection) => {
      const parentId = getParentVariableCollectionId(collection);
      const isExt = isExtendedCollection(collection);

      return {
        id: collection.id,
        name: collection.name || `Collection ${collection.id.slice(0, 8)}`,
        modes: collection.modes.map((mode) => ({
          modeId: mode.modeId,
          name: mode.name || `Mode ${mode.modeId.slice(0, 8)}`,
        })),
        parentCollectionId: parentId,
        isExtended: isExt,
      };
    });

    return { collections };
  } catch (error) {
    console.error('Error getting variable collections:', error);
    return { collections: [] };
  }
};
