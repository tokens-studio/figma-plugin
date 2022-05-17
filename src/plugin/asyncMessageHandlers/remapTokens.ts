import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { defaultNodeManager } from '../NodeManager';
import { updatePluginData } from '../pluginData';
import { sendSelectionChange } from '../sendSelectionChange';

export const remapTokens: AsyncMessageChannelHandlers[AsyncMessageTypes.REMAP_TOKENS] = async (msg) => {
  try {
    const {
      oldName, newName, updateMode, category,
    } = msg;
    const allWithData = await defaultNodeManager.findNodesWithData({
      updateMode,
    });

    // Go through allWithData and update all appearances of oldName to newName
    const updatedNodes = allWithData.reduce((all, node) => {
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
        all.push({
          ...node,
          tokens: updatedTokens,
        });
      }
      return all;
    }, []);
    await updatePluginData({ entries: updatedNodes, values: {}, shouldOverride: true });

    await sendSelectionChange();
  } catch (e) {
    console.error(e);
  }
};
