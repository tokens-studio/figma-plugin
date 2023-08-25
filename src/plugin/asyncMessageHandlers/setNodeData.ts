import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { tokenArrayGroupToMap } from '@/utils/tokenArrayGroupToMap';
import { updateNodes } from '../updateNodes';
import { defaultNodeManager } from '../NodeManager';
import { sendPluginValues } from '../pluginData';
import { updatePluginData } from '../updatePluginData';

export const setNodeData: AsyncMessageChannelHandlers[AsyncMessageTypes.SET_NODE_DATA] = async (msg) => {
  try {
    if (figma.currentPage.selection.length) {
      const tokensMap = tokenArrayGroupToMap(msg.tokens);
      const nodes = await defaultNodeManager.update(figma.currentPage.selection);
      await updatePluginData({ entries: nodes, values: msg.values, tokensMap });
      await updateNodes(nodes, tokensMap, msg.settings);
      await sendPluginValues({
        nodes: figma.currentPage.selection,
        shouldSendSelectionValues: false,
      });
    }
  } catch (e) {
    console.error(e);
  }
};
