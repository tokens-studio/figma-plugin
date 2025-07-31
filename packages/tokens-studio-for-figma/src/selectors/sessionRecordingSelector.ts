import { createSelector } from 'reselect';
import { settingsStateSelector } from './settingsStateSelector';

export const sessionRecordingSelector = createSelector(
  settingsStateSelector,
  (state) => state.sessionRecording,
);
