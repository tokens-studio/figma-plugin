import type { SettingsState } from '../../settings';

export function setRenameExistingStylesAndVariables(state: SettingsState, payload: boolean): SettingsState {
  return {
    ...state,
    renameExistingStylesAndVariables: payload,
  };
}
