import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { defaultNodeManager, NodeManagerNode } from '../NodeManager';
import { updatePluginData } from '../updatePluginData';
import { sendSelectionChange } from '../sendSelectionChange';

export const bulkRemapTokens: AsyncMessageChannelHandlers[AsyncMessageTypes.BULK_REMAP_TOKENS] = async (msg) => {
  // Big O(n * m) + Big O(updatePluginData) + Big O(sendSelectionChange): (n = amount of nodes, m = amount of tokens in the node)
  try {
    const { oldName, newName } = msg;
    const allWithData = await defaultNodeManager.findNodesWithData({ updateMode: msg.updateMode });
    const updatedNodes: NodeManagerNode[] = [];

    allWithData.forEach((node) => {
      const { tokens } = node;
      let shouldBeRemapped = false;
      const updatedTokens = Object.entries(tokens).reduce<Record<string, string>>((acc, [key, val]) => {
        if (val.includes(oldName)) {
          acc[key] = val.replace(oldName, newName);
          shouldBeRemapped = true;
        } else {
          acc[key] = val;
        }
        return acc;
      }, {});
      if (shouldBeRemapped) {
        updatedNodes.push({
          ...node,
          tokens: updatedTokens,
        });
      }
    });

    await updatePluginData({ entries: updatedNodes, values: {}, shouldOverride: true });
    await sendSelectionChange();
  } catch (e) {
    console.error(e);
  }
};
