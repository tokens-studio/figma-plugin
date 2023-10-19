import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { updateLocalTokensData } from '@/utils/figma';
import { tokenArrayGroupToMap } from '@/utils/tokenArrayGroupToMap';
import { updateNodes } from '../updateNodes';
import { NodeManagerNode, defaultNodeManager } from '../NodeManager';
import updateStyles from '../updateStyles';
import { swapStyles } from './swapStyles';
import { getThemeReferences } from './getThemeReferences';

export const update: AsyncMessageChannelHandlers[AsyncMessageTypes.UPDATE] = async (msg) => {
  let receivedStyleIds: Record<string, string> = {};
  let allWithData: NodeManagerNode[] = [];
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
  if (msg.settings.updateStyles && msg.tokens) {
    receivedStyleIds = await updateStyles(msg.tokens, msg.settings, false);
  }
  if (msg.tokens) {
    const tokensMap = tokenArrayGroupToMap(msg.tokens);
    allWithData = await defaultNodeManager.findBaseNodesWithData({
      updateMode: msg.settings.updateMode,
    });
    const {
      figmaStyleMaps, figmaVariableReferences, figmaStyleReferences, stylePathPrefix,
    } = await getThemeReferences(msg.settings.prefixStylesWithThemeName);
    await updateNodes(allWithData, tokensMap, figmaStyleMaps, figmaVariableReferences, figmaStyleReferences, msg.settings, stylePathPrefix);
    if (msg.activeTheme && msg.themes && msg.settings.shouldSwapStyles) {
      await swapStyles(msg.activeTheme, msg.themes, msg.settings.updateMode);
    }
  }

  return {
    styleIds: receivedStyleIds,
    nodes: allWithData.length,
  };
};
