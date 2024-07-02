import type { SettingsState } from '../../settings';

export function setStylesTypography(state: SettingsState, payload: boolean): SettingsState {
  return {
    ...state,
    stylesTypography: payload,
  };
}
