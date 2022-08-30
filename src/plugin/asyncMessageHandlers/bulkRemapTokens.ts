import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { defaultNodeManager, NodeManagerNode } from '../NodeManager';
import { updatePluginData } from '../pluginData';
import { sendSelectionChange } from '../sendSelectionChange';

export const bulkRemapTokens: AsyncMessageChannelHandlers[AsyncMessageTypes.BULK_REMAP_TOKENS] = async (msg) => {
  try {
    const {
      matchingToken, newToken
    } = msg;
    const allWithData = await defaultNodeManager.findNodesWithData({});
    console.log("all", allWithData)

    const updatedNodes: NodeManagerNode[] = [];
    console.log("matching", matchingToken)

    allWithData.forEach((node) => {
      const { tokens } = node;
      const updatedTokens = Object.entries(tokens).reduce<Record<string, string>>((acc, [key, val]) => {
        if (val.startsWith(matchingToken)) {
          acc[key] = val.replace(matchingToken, newToken);
        } else {
          acc[key] = val;
        }
        return acc;
      }, {});
      console.log("updated", updatedTokens)
      updatedNodes.push({
        ...node,
        tokens: updatedTokens,
      });
    });
    console.log("updated", updatedNodes)
    await updatePluginData({ entries: updatedNodes, values: {}, shouldOverride: true });
    await sendSelectionChange();
  } catch (e) {
    console.error(e);
  }
};
