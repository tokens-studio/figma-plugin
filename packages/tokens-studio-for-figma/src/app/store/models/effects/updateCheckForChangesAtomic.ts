import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

export async function updateCheckForChangesAtomic(checkForChanges: boolean) {
  await AsyncMessageChannel.ReactInstance.message({
    type: AsyncMessageTypes.UPDATE_CHECK_FOR_CHANGES,
    checkForChanges,
  });
}
