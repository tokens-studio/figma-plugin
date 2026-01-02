import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import type { VariableCollectionInfo } from '@/types/VariableCollectionSelection';
import { getParentVariableCollectionId, isExtendedCollection } from '../extendedCollectionHelpers';

export const getAvailableVariableCollections: AsyncMessageChannelHandlers[AsyncMessageTypes.GET_AVAILABLE_VARIABLE_COLLECTIONS] = async (): Promise<{
  collections: VariableCollectionInfo[]
}> => {
  console.log('🔍 DEBUG: getAvailableVariableCollections called - Phase 1 code loaded!');
  
  try {
    const allCollections = await figma.variables.getLocalVariableCollectionsAsync();

    console.log('=== EXTENDED COLLECTIONS DEBUG ===');
    console.log('Total collections found:', allCollections.length);

    const collections: VariableCollectionInfo[] = allCollections.map((collection) => {
      const parentId = getParentVariableCollectionId(collection);
      const isExt = isExtendedCollection(collection);
      
      // Debug log for each collection
      console.log(`\nCollection: "${collection.name}"`);
      console.log('  ID:', collection.id);
      console.log('  parentVariableCollectionId:', collection.parentVariableCollectionId);
      console.log('  Calculated parentId:', parentId);
      console.log('  isExtended:', isExt);
      console.log('  Has extend method:', typeof collection.extend === 'function');
      console.log('  variableIds count:', collection.variableIds?.length || 0);
      
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

    console.log('\n=== FINAL COLLECTIONS ARRAY ===');
    console.log(JSON.stringify(collections, null, 2));
    console.log('=================================\n');

    return { collections };
  } catch (error) {
    console.error('❌ Error getting variable collections:', error);
    return { collections: [] };
  }
};
