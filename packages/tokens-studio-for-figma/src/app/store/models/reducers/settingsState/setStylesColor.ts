import type { SettingsState } from '../../settings';

export function setStylesColor(state: SettingsState, payload: boolean): SettingsState {
  return {
    ...state,
    stylesColor: payload,
  };
}
