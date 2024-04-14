import type { RootState } from '@/app/store';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

export function setVariablesBoolean() {
  return (payload: boolean, rootState: RootState): void => {
    AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.SET_UI,
      ...rootState.settings,
    });
  };
}
