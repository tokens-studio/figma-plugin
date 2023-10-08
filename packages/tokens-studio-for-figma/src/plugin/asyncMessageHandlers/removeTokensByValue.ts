import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { sendSelectionChange } from '../sendSelectionChange';
import { removePluginDataByMap } from '../removePluginDataByMap';
import { Properties } from '@/constants/Properties';

export const removeTokensByValue: AsyncMessageChannelHandlers[AsyncMessageTypes.REMOVE_TOKENS_BY_VALUE] = async (msg) => {
  const nodesToRemove: { node: BaseNode, key: Properties }[] = [];

  msg.tokensToRemove.forEach((token) => {
    token.nodes.forEach(((node) => {
      const figmaNode = figma.getNodeById(node.id);
      if (figmaNode) nodesToRemove.push({ node: figmaNode, key: token.property });
    }));
  });

  if (nodesToRemove.length) await removePluginDataByMap({ nodeKeyMap: nodesToRemove });

  sendSelectionChange();
};
