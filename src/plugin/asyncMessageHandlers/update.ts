import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { updateLocalTokensData } from '@/utils/figma';
import { tokenArrayGroupToMap } from '@/utils/tokenArrayGroupToMap';
import { updateNodes } from '../node';
import { defaultNodeManager } from '../NodeManager';
import { updatePluginData } from '../pluginData';
import updateStyles from '../updateStyles';
import { swapStyles } from './swapStyles';
import createLocalVariablesInPlugin from '../createLocalVariablesInPlugin';
import { mergeTokenGroups, resolveTokenValues } from '../tokenHelpers';

export const update: AsyncMessageChannelHandlers[AsyncMessageTypes.UPDATE] = async (msg) => {
  let receivedStyleIds: Record<string, string> = {};
  if (msg.tokenValues && msg.updatedAt) {
    await updateLocalTokensData({
      tokens: msg.tokenValues,
      themes: msg.themes,
      activeTheme: msg.activeTheme,
      usedTokenSets: msg.usedTokenSet,
      updatedAt: msg.updatedAt,
      checkForChanges: msg.checkForChanges ?? false,
      collapsedTokenSets: msg.collapsedTokenSets,
    });
  }
  const mergedTokens = msg.tokens
    ? resolveTokenValues(mergeTokenGroups(msg.tokens, msg.usedTokenSet))
    : null;

  if (msg.settings.updateStyles && msg.tokens && mergedTokens) {
    receivedStyleIds = await updateStyles(mergedTokens, msg.settings, false);

    await createLocalVariablesInPlugin(msg.tokens, msg.settings, false);
  }
  if (mergedTokens) {
    const tokensMap = tokenArrayGroupToMap(mergedTokens);
    const allWithData = await defaultNodeManager.findNodesWithData({
      updateMode: msg.settings.updateMode,
    });
    await updateNodes(allWithData, tokensMap, msg.settings);
    await updatePluginData({ entries: allWithData, values: {} });
    if (msg.activeTheme && msg.themes && msg.settings.shouldSwapStyles) {
      await swapStyles(msg.activeTheme, msg.themes, msg.settings.updateMode);
    }
  }

  return {
    styleIds: receivedStyleIds,
  };
};
