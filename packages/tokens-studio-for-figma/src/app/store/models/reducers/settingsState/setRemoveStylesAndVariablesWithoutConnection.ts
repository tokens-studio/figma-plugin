import type { SettingsState } from '../../settings';

export function setRemoveStylesAndVariablesWithoutConnection(state: SettingsState, payload: boolean): SettingsState {
  return {
    ...state,
    removeStylesAndVariablesWithoutConnection: payload,
  };
}
