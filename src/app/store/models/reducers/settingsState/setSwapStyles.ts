import type { SettingsState } from '../../settings';

export function setSwapStyles(state: SettingsState, payload: boolean) {
  return {
    ...state,
    swapStyles: payload,
  };
}
