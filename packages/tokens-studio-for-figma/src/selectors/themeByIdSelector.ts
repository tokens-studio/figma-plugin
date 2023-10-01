import { createSelector } from 'reselect';
import { themesListSelector } from './themesListSelector';
import type { RootState } from '@/app/store';

const idSelector = (state: RootState, id: string) => id;
export const themeByIdSelector = createSelector(
  idSelector,
  themesListSelector,
  (id, themes) => (
    themes.find((theme) => (
      theme.id === id
    )) ?? null
  ),
);
