import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

export function selectNodes(ids: string[]) {
  AsyncMessageChannel.ReactInstance.message({
    type: AsyncMessageTypes.SELECT_NODES,
    ids,
  });
}
