import { createSelector } from 'reselect';
import { RootState } from '@/app/store';

export const autoApplyThemeOnDropSelector = createSelector(
  (state: RootState) => state.settings.autoApplyThemeOnDrop,
  (autoApplyThemeOnDrop) => autoApplyThemeOnDrop ?? false,
);
