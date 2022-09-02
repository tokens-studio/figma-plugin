import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import removeStylesFromPlugin from '../removeStylesFromPlugin';

export const removeStyles: AsyncMessageChannelHandlers[AsyncMessageTypes.REMOVE_STYLES] = async (msg) => removeStylesFromPlugin(msg.token, msg.settings);
