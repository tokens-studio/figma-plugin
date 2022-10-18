import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { UpdateMode } from '@/constants/UpdateMode';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { tokenArrayGroupToMap } from '@/utils/tokenArrayGroupToMap';
import { updateNodes } from '../node';
import { defaultNodeManager, NodeManagerNode } from '../NodeManager';
import { updatePluginData } from '../pluginData';
import { sendSelectionChange } from '../sendSelectionChange';
import { TokenTypes } from '@/constants/TokenTypes';

export const remapTokens: AsyncMessageChannelHandlers[AsyncMessageTypes.REMAP_TOKENS] = async (msg) => {
  try {
    const {
      oldName, newName, updateMode, category, tokens,
    } = msg;
    const allWithData = await defaultNodeManager.findNodesWithData({
      updateMode,
    });
    // Go through allWithData and update all appearances of oldName to newName
    const updatedNodes: NodeManagerNode[] = [];
    const updatedNodesWithOldTokens: NodeManagerNode[] = [];

    allWithData.forEach((node) => {
      const { tokens } = node;
      let shouldBeRemapped = false;
      // @TODO I dont believe this typing is quite right - need to check and fix
      const updatedTokens = Object.entries(tokens).reduce<Record<string, string>>((acc, [key, val]) => {
        if (typeof category !== 'undefined' && key !== category) {
          acc[key] = val;
          return acc;
        }
        if (val === oldName) {
          acc[key] = newName;
          shouldBeRemapped = true;
        } else {
          acc[key] = val;
        }
        return acc;
      }, {});

      if (shouldBeRemapped) {
        updatedNodes.push({
          ...node,
          tokens: updatedTokens,
        });
        updatedNodesWithOldTokens.push({
          ...node,
          tokens,
        });
      }
    });
    if (updateMode === UpdateMode.SELECTION && category && tokens) {
      const tokensMap = tokenArrayGroupToMap(tokens);
      if (category === TokenTypes.COMPOSITION) {
        await updatePluginData({
          entries: updatedNodesWithOldTokens, values: { [category]: newName }, shouldOverride: true, tokensMap,
        });
      } else {
        await updatePluginData({
          entries: updatedNodes, values: { [category]: newName }, shouldOverride: true, tokensMap,
        });
      }
      await updateNodes(updatedNodes, tokensMap, msg.settings);
    } else {
      await updatePluginData({ entries: updatedNodes, values: {}, shouldOverride: true });
    }
    await sendSelectionChange();
  } catch (e) {
    console.error(e);
  }
};
