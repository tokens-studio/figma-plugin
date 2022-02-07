import { Models } from '@rematch/core';
import { settings } from './settings';
import { uiState } from './uiState';
import { tokenState } from './tokenState';
import { inspectState } from './inspectState';

export interface RootModel extends Models<RootModel> {
  settings: typeof settings;
  uiState: typeof uiState;
  tokenState: typeof tokenState;
  inspectState: typeof inspectState;
}

export const models: RootModel = {
  uiState, settings, tokenState, inspectState,
};
