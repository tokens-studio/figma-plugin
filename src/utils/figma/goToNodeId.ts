import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

export function goToNodeId(id: string) {
  AsyncMessageChannel.message({
    type: AsyncMessageTypes.GOTO_NODE,
    id,
  });
}
