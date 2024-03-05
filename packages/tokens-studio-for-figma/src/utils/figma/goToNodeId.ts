import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

export function goToNodeId(id: string) {
  AsyncMessageChannel.ReactInstance.message({
    type: AsyncMessageTypes.GOTO_NODE,
    id,
  });
}
