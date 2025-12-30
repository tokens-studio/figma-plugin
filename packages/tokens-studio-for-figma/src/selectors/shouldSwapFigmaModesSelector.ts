import { createSelector } from 'reselect';
import { RootState } from '@/app/store';

export const shouldSwapFigmaModesSelector = createSelector(
  (state: RootState) => state.settings.shouldSwapFigmaModes,
  (shouldSwapFigmaModes) => shouldSwapFigmaModes ?? true,
);
