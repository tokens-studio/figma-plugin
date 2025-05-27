import { RootState } from '@/app/store';

export const exportSettingsSelector = (state: RootState) => state.uiState.exportSettings;