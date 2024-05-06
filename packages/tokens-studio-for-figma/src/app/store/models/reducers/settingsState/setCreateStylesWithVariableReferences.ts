import type { SettingsState } from '../../settings';

export function setCreateStylesWithVariableReferences(state: SettingsState, payload: boolean): SettingsState {
  return {
    ...state,
    createStylesWithVariableReferences: payload,
  };
}
