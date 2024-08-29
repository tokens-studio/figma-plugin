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
      figmaVariableReferences, figmaStyleReferences, potentialStylePathPrefixes,
    } = await getThemeReferences(msg.settings.prefixStylesWithThemeName);
    defaultTokenValueRetriever.initiate({
      tokens: msg.tokens,
      variableReferences: figmaVariableReferences,
      styleReferences: figmaStyleReferences,
      potentialStylePathPrefixes,
      ignoreFirstPartForStyles: msg.settings.ignoreFirstPartForStyles,
      createStylesWithVariableReferences: msg.settings.createStylesWithVariableReferences,
      applyVariablesStylesOrRawValue: msg.settings.applyVariablesStylesOrRawValue,
    });
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
