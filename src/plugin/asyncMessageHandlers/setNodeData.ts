import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { tokenArrayGroupToMap } from '@/utils/tokenArrayGroupToMap';
import { updateNodes } from '../node';
import { defaultNodeManager } from '../NodeManager';
import { notifyRemoteComponents } from '../notifiers';
import { sendPluginValues, updatePluginData } from '../pluginData';
import store from '../store';

export const setNodeData: AsyncMessageChannelHandlers[AsyncMessageTypes.SET_NODE_DATA] = async (msg) => {
  try {
    if (figma.currentPage.selection.length) {
      const tokensMap = tokenArrayGroupToMap(msg.tokens);

      const nodes = await defaultNodeManager.update(figma.currentPage.selection);
      await updatePluginData({ entries: nodes, values: msg.values });
      await sendPluginValues({
        nodes: figma.currentPage.selection,
        values: await updateNodes(nodes, tokensMap, msg.settings),
        shouldSendSelectionValues: false,
      });
    }
  } catch (e) {
    console.error(e);
  }
  notifyRemoteComponents({
    nodes: store.successfulNodes.size,
    remotes: store.remoteComponents,
  });
};
