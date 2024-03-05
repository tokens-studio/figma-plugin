import type { SettingsState } from '../../settings';

export function setPrefixStylesWithThemeName(state: SettingsState, payload: boolean): SettingsState {
  return {
    ...state,
    prefixStylesWithThemeName: payload,
  };
}
