import type { SettingsState } from '../../settings';

export function setScopeVariablesByTokenType(state: SettingsState, payload: boolean): SettingsState {
  return {
    ...state,
    scopeVariablesByTokenType: payload,
  };
}
