import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { tokenArrayGroupToMap } from '@/utils/tokenArrayGroupToMap';
import { updateNodes } from '../node';
import { defaultNodeManager } from '../NodeManager';
import { updatePluginData } from '../pluginData';
import { sendSelectionChange } from '../sendSelectionChange';

export const setNoneValuesOnNode: AsyncMessageChannelHandlers[AsyncMessageTypes.SET_NONE_VALUES_ON_NODE] = async (msg) => {
  const nodesToRemove: { [key: string]: string[] } = {};

  msg.tokensToSet.forEach((token) => {
    token.nodes.forEach(({ id }) => {
      nodesToRemove[id] = nodesToRemove[id] ? [...nodesToRemove[id], token.property] : [token.property];
    });
  });
  const tokensMap = tokenArrayGroupToMap(msg.tokens);

  await Promise.all(
    Object.entries(nodesToRemove).map(async (node) => {
      const newEntries = node[1].reduce<Record<string, string>>((acc, curr) => {
        acc[curr] = 'none';
        return acc;
      }, {});

      const nodeToUpdate = await defaultNodeManager.getNode(node[0]);
      if (nodeToUpdate) {
        await updatePluginData({
          entries: [nodeToUpdate], values: newEntries, tokensMap,
        });
        await updateNodes([nodeToUpdate], tokensMap);
      }
    }),
  );
  sendSelectionChange();
};
