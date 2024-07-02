import type { SettingsState } from '../../settings';

export function setIgnoreFirstPartForStyles(state: SettingsState, payload: boolean): SettingsState {
  return {
    ...state,
    ignoreFirstPartForStyles: payload,
  };
}
