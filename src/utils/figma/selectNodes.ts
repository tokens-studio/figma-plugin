import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

export function selectNodes(ids: string[]) {
  AsyncMessageChannel.message({
    type: AsyncMessageTypes.SELECT_NODES,
    ids,
  });
}
