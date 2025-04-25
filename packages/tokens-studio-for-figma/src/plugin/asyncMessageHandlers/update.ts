import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { updateLocalTokensData } from '@/utils/figma';
import { updateNodes } from '../updateNodes';
import { NodeManagerNode, defaultNodeManager } from '../NodeManager';
import { swapStyles } from './swapStyles';
import { getThemeReferences } from './getThemeReferences';
import { defaultTokenValueRetriever } from '../TokenValueRetriever';
import { TokenFormatOptions } from '../TokenFormatStoreClass';
import { ApplyVariablesStylesOrRawValues } from '@/constants/ApplyVariablesStyleOrder';
import updateStyles from '../updateStyles';

export const update: AsyncMessageChannelHandlers[AsyncMessageTypes.UPDATE] = async (msg) => {
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
      applyVariablesStylesOrRawValue: msg.settings.applyVariablesStylesOrRawValue,
    });

    // If the user has shouldUpdateStyles enabled, we need to upate styles (last used settings will be used, and we're using active themes)
    if (msg.settings.shouldUpdateStyles) {
      await updateStyles(msg.tokens, msg.settings, false);
    }

    allWithData = await defaultNodeManager.findBaseNodesWithData({
      updateMode: msg.settings.updateMode,
    });

    await updateNodes(allWithData, msg.settings);
    const shouldApplyStyles = msg.settings.applyVariablesStylesOrRawValue === ApplyVariablesStylesOrRawValues.VARIABLES_STYLES;
    if (msg.activeTheme && msg.themes && msg.settings.shouldSwapStyles && shouldApplyStyles) {
      await swapStyles(msg.activeTheme, msg.themes, msg.settings.updateMode);
    }
  }

  return {
    nodes: allWithData.length,
  };
};
