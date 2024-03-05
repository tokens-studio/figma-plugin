import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { tokenArrayGroupToMap } from '@/utils/tokenArrayGroupToMap';
import { updatePluginDataAndNodes } from '../updatePluginDataAndNodes';
import { sendSelectionChange } from '../sendSelectionChange';
import { getThemeReferences } from './getThemeReferences';

export const setNodeData: AsyncMessageChannelHandlers[AsyncMessageTypes.SET_NODE_DATA] = async (msg) => {
  try {
    if (figma.currentPage.selection.length) {
      const tokensMap = tokenArrayGroupToMap(msg.tokens);
      const nodes = figma.currentPage.selection;
      const {
        figmaStyleMaps, figmaVariableReferences, figmaStyleReferences, stylePathPrefix,
      } = await getThemeReferences(msg.settings.prefixStylesWithThemeName);

      await updatePluginDataAndNodes({
        entries: nodes, values: msg.values, tokensMap, figmaStyleMaps, figmaVariableReferences, figmaStyleReferences, stylePathPrefix, settings: msg.settings,
      });
      sendSelectionChange();
    }
  } catch (e) {
    console.error(e);
  }
};
