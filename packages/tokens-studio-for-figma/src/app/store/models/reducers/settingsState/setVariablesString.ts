import type { SettingsState } from '../../settings';

export function setVariablesString(state: SettingsState, payload: boolean): SettingsState {
  return {
    ...state,
    variablesString: payload,
  };
}
