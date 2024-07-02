import type { SettingsState } from '../../settings';

export function setVariablesNumber(state: SettingsState, payload: boolean): SettingsState {
  return {
    ...state,
    variablesNumber: payload,
  };
}
