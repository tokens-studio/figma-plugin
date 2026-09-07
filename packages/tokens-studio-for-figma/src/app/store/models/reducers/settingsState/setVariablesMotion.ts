import type { SettingsState } from '../../settings';

export function setVariablesMotion(state: SettingsState, payload: boolean): SettingsState {
  return {
    ...state,
    variablesMotion: payload,
  };
}
