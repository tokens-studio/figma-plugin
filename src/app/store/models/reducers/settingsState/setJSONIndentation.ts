import { JSONIndentationSettings } from '@/types';
import type { SettingsState } from '../../settings';

export function setJSONIndentation(state: SettingsState, payload: JSONIndentationSettings): SettingsState {
  return {
    ...state,
    jsonIndentation: payload,
  };
}
