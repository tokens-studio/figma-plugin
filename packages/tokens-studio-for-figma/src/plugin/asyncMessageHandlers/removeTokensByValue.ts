import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { sendSelectionChange } from '../sendSelectionChange';
import { removePluginDataByMap } from '../removePluginDataByMap';
import { Properties } from '@/constants/Properties';

export const removeTokensByValue: AsyncMessageChannelHandlers[AsyncMessageTypes.REMOVE_TOKENS_BY_VALUE] = async (msg) => {
  const nodesToRemove: { node: BaseNode, key: Properties }[] = [];

  for (const token of msg.tokensToRemove) {
    for (const node of token.nodes) {
      const figmaNode = await figma.getNodeByIdAsync(node.id);
      if (figmaNode) nodesToRemove.push({ node: figmaNode, key: token.property });
    }
  }

  if (nodesToRemove.length) await removePluginDataByMap({ nodeKeyMap: nodesToRemove });

  sendSelectionChange();
};
