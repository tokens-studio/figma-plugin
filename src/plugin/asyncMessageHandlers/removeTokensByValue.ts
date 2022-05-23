import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { defaultNodeManager } from '../NodeManager';
import { updatePluginData } from '../pluginData';
import { sendSelectionChange } from '../sendSelectionChange';

export const removeTokensByValue: AsyncMessageChannelHandlers[AsyncMessageTypes.REMOVE_TOKENS_BY_VALUE] = async (msg) => {
  const nodesToRemove: { [key: string]: string[] } = {};

  msg.tokensToRemove.forEach((token) => {
    token.nodes.forEach(({ id }) => {
      nodesToRemove[id] = nodesToRemove[id] ? [...nodesToRemove[id], token.property] : [token.property];
    });
  });

  await Promise.all(
    Object.entries(nodesToRemove).map(async (node) => {
      const newEntries = node[1].reduce<Record<string, string>>((acc, curr) => {
        acc[curr] = 'delete';
        return acc;
      }, {});

      const nodeToUpdate = await defaultNodeManager.getNode(node[0]);
      if (nodeToUpdate) {
        await updatePluginData({ entries: [nodeToUpdate], values: newEntries, shouldRemove: false });
      }
    }),
  );
  sendSelectionChange();
};
