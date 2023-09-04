import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { getTransport } from '../sentry';

export const proxySentry: AsyncMessageChannelHandlers[AsyncMessageTypes.PROXY_SENTRY] = async (params) => {
  const result = await getTransport().send(params.request);
  return {
    result,
  };
};
