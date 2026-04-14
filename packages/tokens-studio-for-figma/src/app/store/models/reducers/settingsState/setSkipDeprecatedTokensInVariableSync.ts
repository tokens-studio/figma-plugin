import type { SettingsState } from '../../settings';

export function setSkipDeprecatedTokensInVariableSync(state: SettingsState, payload: boolean): SettingsState {
  return {
    ...state,
    skipDeprecatedTokensInVariableSync: payload,
  };
}
