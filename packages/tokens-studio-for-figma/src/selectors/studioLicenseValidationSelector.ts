import { createSelector } from 'reselect';
import { settingsStateSelector } from './settingsStateSelector';

export const studioLicenseValidationSelector = createSelector(
  settingsStateSelector,
  (state) => state.studioLicenseValidation,
);
