import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import renameVariablesFromPlugin from '../renameVariablesFromPlugin';

export const renameVariables: AsyncMessageChannelHandlers[AsyncMessageTypes.RENAME_VARIABLES] = async (msg) => ({
  renameVariableToken: await renameVariablesFromPlugin(msg.tokens),
});
