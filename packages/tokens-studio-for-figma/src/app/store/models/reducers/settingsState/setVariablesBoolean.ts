import type { SettingsState } from '../../settings';

export function setVariablesBoolean(state: SettingsState, payload: boolean): SettingsState {
  return {
    ...state,
    variablesBoolean: payload,
  };
}
