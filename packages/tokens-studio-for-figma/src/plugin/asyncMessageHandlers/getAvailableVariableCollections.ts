import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import type { VariableCollectionInfo } from '@/types/VariableCollectionSelection';

export const getAvailableVariableCollections: AsyncMessageChannelHandlers[AsyncMessageTypes.GET_AVAILABLE_VARIABLE_COLLECTIONS] = async (): Promise<{
  collections: VariableCollectionInfo[]
}> => {
  try {
    const allCollections = await figma.variables.getLocalVariableCollectionsAsync();

    const byId = new Map(allCollections.map((c) => [c.id, c as any]));

    const collections: VariableCollectionInfo[] = allCollections.map((collection) => {
      const extendedCollection = collection as any;

      let extensionDepth = 0;
      let current: any = extendedCollection;
      while (current?.isExtension && current?.parentVariableCollectionId && byId.has(current.parentVariableCollectionId)) {
        extensionDepth += 1;
        current = byId.get(current.parentVariableCollectionId);
      }

      return {
        id: collection.id,
        name: collection.name || `Collection ${collection.id.slice(0, 8)}`,
        isExtension: extendedCollection.isExtension || false,
        parentCollectionId: extendedCollection.isExtension
          ? extendedCollection.parentVariableCollectionId
          : undefined,
        extensionDepth,
        modes: collection.modes.map((mode) => ({
          modeId: mode.modeId,
          name: mode.name || `Mode ${mode.modeId.slice(0, 8)}`,
          parentModeId: (mode as any).parentModeId,
        })),
      };
    });

    return { collections };
  } catch (error) {
    console.error('Error getting variable collections:', error);
    return { collections: [] };
  }
};
