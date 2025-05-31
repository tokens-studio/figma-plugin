import type { RootState } from '@/app/store';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

export function setCreateStylesWithVariableReferences() {
  return (payload: boolean, rootState: RootState): void => {
    AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.SET_UI,
      ...rootState.settings,
    });

    // Save variable export settings to shared plugin data
    const settings = {
      ignoreFirstPartForStyles: rootState.settings.ignoreFirstPartForStyles,
      prefixStylesWithThemeName: rootState.settings.prefixStylesWithThemeName,
      createStylesWithVariableReferences: payload,
      renameExistingStylesAndVariables: rootState.settings.renameExistingStylesAndVariables,
      removeStylesAndVariablesWithoutConnection: rootState.settings.removeStylesAndVariablesWithoutConnection,
    };

    AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.SET_VARIABLE_EXPORT_SETTINGS,
      settings: JSON.stringify(settings),
    });
  };
}
