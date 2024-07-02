import type { SettingsState } from '../../settings';

export function setVariablesColor(state: SettingsState, payload: boolean): SettingsState {
  return {
    ...state,
    variablesColor: payload,
  };
}
