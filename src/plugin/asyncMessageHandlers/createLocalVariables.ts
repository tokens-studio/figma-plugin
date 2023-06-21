import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import createLocalVariablesInPlugin from '../createLocalVariablesInPlugin';

export const createLocalVariables: AsyncMessageChannelHandlers[AsyncMessageTypes.CREATE_LOCAL_VARIABLES] = async (msg) => ({
  variableIds: await createLocalVariablesInPlugin(msg.tokens, msg.settings),
});
