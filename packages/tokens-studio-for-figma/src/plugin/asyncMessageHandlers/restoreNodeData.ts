import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';

export const restoreNodeData: AsyncMessageChannelHandlers[AsyncMessageTypes.RESTORE_NODE_DATA] = async (msg) => {
  try {
    const { nodeDataToRestore } = msg;
    const namespace = SharedPluginDataNamespaces.TOKENS;

    nodeDataToRestore.forEach(({ nodeId, data }) => {
      const node = figma.getNodeById(nodeId);
      if (node) {
        // Clear existing data for this node
        const existingKeys = node.getSharedPluginDataKeys(namespace);
        existingKeys.forEach((key) => {
          node.setSharedPluginData(namespace, key, '');
        });

        // Restore the original data
        Object.entries(data).forEach(([key, value]) => {
          node.setSharedPluginData(namespace, key, value);
        });
      }
    });
  } catch (e) {
    console.error('Error restoring node data:', e);
  }
};
