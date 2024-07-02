import type { SettingsState } from '../../settings';

export function setStylesEffect(state: SettingsState, payload: boolean): SettingsState {
  return {
    ...state,
    stylesEffect: payload,
  };
}
