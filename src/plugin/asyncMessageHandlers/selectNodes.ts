import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import {
  selectNodes as selectNodesFn,
} from '../node';

export const selectNodes: AsyncMessageChannelHandlers[AsyncMessageTypes.SELECT_NODES] = async (msg) => {
  selectNodesFn(msg.ids);
};
