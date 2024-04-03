import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { updateLocalTokensData } from '@/utils/figma';
import { updateNodes } from '../updateNodes';
import { NodeManagerNode, defaultNodeManager } from '../NodeManager';
import updateStyles from '../updateStyles';
import { swapStyles } from './swapStyles';
import { getThemeReferences } from './getThemeReferences';
import { defaultTokenValueRetriever } from '../TokenValueRetriever';
import { TokenFormatOptions } from '../TokenFormatStoreClass';

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
      tokenFormat: msg.tokenFormat || TokenFormatOptions.Legacy,
    });
  }
  if (msg.tokens) {
    const {
      figmaVariableReferences, figmaStyleReferences, stylePathPrefix,
    } = await getThemeReferences(msg.settings.prefixStylesWithThemeName);
    defaultTokenValueRetriever.initiate({
      tokens: msg.tokens,
      variableReferences: figmaVariableReferences,
      styleReferences: figmaStyleReferences,
      stylePathPrefix,
      ignoreFirstPartForStyles: msg.settings.ignoreFirstPartForStyles,
      createStylesWithVariableReferences: msg.settings.createStylesWithVariableReferences,
    });
    if (msg.settings.updateStyles) {
      receivedStyleIds = await updateStyles(msg.tokens, msg.settings, false);
    }
    allWithData = await defaultNodeManager.findBaseNodesWithData({
      updateMode: msg.settings.updateMode,
    });

    await updateNodes(allWithData, msg.settings);
    if (msg.activeTheme && msg.themes && msg.settings.shouldSwapStyles) {
      await swapStyles(msg.activeTheme, msg.themes, msg.settings.updateMode);
    }
  }

  return {
    styleIds: receivedStyleIds,
    nodes: allWithData.length,
  };
};
