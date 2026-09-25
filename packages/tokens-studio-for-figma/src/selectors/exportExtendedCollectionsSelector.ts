import { createSelector } from 'reselect';
import { settingsStateSelector } from './settingsStateSelector';

export const exportExtendedCollectionsSelector = createSelector(
    settingsStateSelector,
    (state) => state.exportExtendedCollections,
);
