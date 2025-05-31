import type { RootState } from '@/app/store';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

export function saveVariableExportSettings() {
  return (_payload: unknown, rootState: RootState): void => {
    const settings = {
      ignoreFirstPartForStyles: rootState.settings.ignoreFirstPartForStyles,
      prefixStylesWithThemeName: rootState.settings.prefixStylesWithThemeName,
      createStylesWithVariableReferences: rootState.settings.createStylesWithVariableReferences,
      renameExistingStylesAndVariables: rootState.settings.renameExistingStylesAndVariables,
      removeStylesAndVariablesWithoutConnection: rootState.settings.removeStylesAndVariablesWithoutConnection,
    };

    AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.SET_VARIABLE_EXPORT_SETTINGS,
      settings: JSON.stringify(settings),
    });
  };
}
