import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import type { VariableCollectionInfo } from '@/types/VariableCollectionSelection';

export const getAvailableVariableCollections: AsyncMessageChannelHandlers[AsyncMessageTypes.GET_AVAILABLE_VARIABLE_COLLECTIONS] = async (): Promise<{
  collections: VariableCollectionInfo[]
}> => {
  try {
    const allCollections = await figma.variables.getLocalVariableCollectionsAsync();

    const byId = new Map(allCollections.map((c) => [c.id, c as any]));

    // Existing extended collections may not expose the isExtension runtime
    // property, so also detect them structurally via parent-linked modes.
    const isExtended = (c: any) => Boolean(
      c?.isExtension || c?.modes?.some((mode: any) => mode.parentModeId !== undefined),
    );

    const collections: VariableCollectionInfo[] = allCollections.map((collection) => {
      const extendedCollection = collection as any;

      const isExtension = isExtended(extendedCollection);
      let extensionDepth = 0;
      let current: any = extendedCollection;
      const visited = new Set<string>([collection.id]);
      while (
        isExtended(current)
        && current?.parentVariableCollectionId
        && byId.has(current.parentVariableCollectionId)
        && !visited.has(current.parentVariableCollectionId)
      ) {
        extensionDepth += 1;
        visited.add(current.parentVariableCollectionId);
        current = byId.get(current.parentVariableCollectionId);
      }
      // An extension whose parent can't be resolved is still at least one level deep
      if (isExtension) {
        extensionDepth = Math.max(extensionDepth, 1);
      }

      return {
        id: collection.id,
        name: collection.name || `Collection ${collection.id.slice(0, 8)}`,
        isExtension,
        parentCollectionId: isExtension
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
