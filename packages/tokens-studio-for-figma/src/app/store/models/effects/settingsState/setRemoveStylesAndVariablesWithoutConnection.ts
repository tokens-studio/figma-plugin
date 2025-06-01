import type { RootState } from '@/app/store';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { saveVariableExportSettings } from './saveVariableExportSettings';

export function setRemoveStylesAndVariablesWithoutConnection() {
  return (payload: boolean, rootState: RootState): void => {
    AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.SET_UI,
      ...rootState.settings,
    });

    saveVariableExportSettings()(payload, rootState);
  };
}
