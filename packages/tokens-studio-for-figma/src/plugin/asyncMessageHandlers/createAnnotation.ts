import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { createAnnotation as createAnnotationFn } from '@/utils/annotations';

export const createAnnotation: AsyncMessageChannelHandlers[AsyncMessageTypes.CREATE_ANNOTATION] = async (msg) => {
  createAnnotationFn(msg.tokens, msg.direction);
};
