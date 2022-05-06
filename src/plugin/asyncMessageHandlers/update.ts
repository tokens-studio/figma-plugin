import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { updateLocalTokensData } from '@/utils/figma';
import { tokenArrayGroupToMap } from '@/utils/tokenArrayGroupToMap';
import { updateNodes } from '../node';
import { defaultNodeManager } from '../NodeManager';
import { notifyRemoteComponents } from '../notifiers';
import { updatePluginData } from '../pluginData';
import store from '../store';
import updateStyles from '../updateStyles';

export const update: AsyncMessageChannelHandlers[AsyncMessageTypes.UPDATE] = async (msg) => {
  let receivedStyleIds: Record<string, string> = {};
  if (msg.settings.updateStyles && msg.tokens) {
    receivedStyleIds = await updateStyles(msg.tokens, false, msg.settings);
  }

  if (msg.tokenValues && msg.updatedAt) {
    updateLocalTokensData({
      tokens: msg.tokenValues,
      themes: msg.themes,
      activeTheme: msg.activeTheme,
      usedTokenSets: msg.usedTokenSet,
      updatedAt: msg.updatedAt,
    });
  }
  if (msg.tokens) {
    const tokensMap = tokenArrayGroupToMap(msg.tokens);
    const allWithData = await defaultNodeManager.findNodesWithData({
      updateMode: msg.settings.updateMode,
    });
    await updateNodes(allWithData, tokensMap, msg.settings);
    await updatePluginData({ entries: allWithData, values: {} });
    notifyRemoteComponents({
      nodes: store.successfulNodes.size,
      remotes: store.remoteComponents,
    });
  }

  return {
    styleIds: receivedStyleIds,
  };
};
