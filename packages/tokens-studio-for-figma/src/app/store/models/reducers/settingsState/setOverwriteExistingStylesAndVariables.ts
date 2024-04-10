import type { SettingsState } from '../../settings';

export function setOverwriteExistingStylesAndVariables(state: SettingsState, payload: boolean): SettingsState {
  return {
    ...state,
    overwriteExistingStylesAndVariables: payload,
  };
}
