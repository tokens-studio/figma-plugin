import type { SettingsState } from '../../settings';

export function setStylesGradient(state: SettingsState, payload: boolean): SettingsState {
  return {
    ...state,
    stylesGradient: payload,
  };
}
