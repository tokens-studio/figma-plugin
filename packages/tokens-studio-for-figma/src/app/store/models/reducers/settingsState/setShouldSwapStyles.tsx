import type { SettingsState } from '../../settings';

export function setShouldSwapStyles(state: SettingsState, payload: boolean) {
  return {
    ...state,
    shouldSwapStyles: payload,
  };
}
