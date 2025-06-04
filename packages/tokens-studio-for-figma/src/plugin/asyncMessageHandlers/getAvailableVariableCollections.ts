import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import type { VariableCollectionInfo } from '@/types/VariableCollectionSelection';

export const getAvailableVariableCollections: AsyncMessageChannelHandlers[AsyncMessageTypes.GET_AVAILABLE_VARIABLE_COLLECTIONS] = async (): Promise<{
  collections: VariableCollectionInfo[]
}> => {
  try {
    const allCollections = await figma.variables.getLocalVariableCollectionsAsync();
    console.log('All collections from Figma API:', JSON.stringify(allCollections, null, 2));

    const collections: VariableCollectionInfo[] = allCollections.map((collection) => {
      console.log(`Processing collection: ${collection.id}, name: "${collection.name}"`);
      console.log(`Modes for collection ${collection.name}:`, JSON.stringify(collection.modes, null, 2));

      return {
        id: collection.id,
        name: collection.name || `Collection ${collection.id.slice(0, 8)}`,
        modes: collection.modes.map((mode) => ({
          modeId: mode.modeId,
          name: mode.name || `Mode ${mode.modeId.slice(0, 8)}`,
        })),
      };
    });

    console.log('Returning collections:', JSON.stringify(collections, null, 2));
    return { collections };
  } catch (error) {
    console.error('Error getting variable collections:', error);
    return { collections: [] };
  }
};
