import type { SettingsState } from '../../settings';

export function setExportExtendedCollections(state: SettingsState, payload: boolean): SettingsState {
    return {
        ...state,
        exportExtendedCollections: payload,
    };
}
