import { init, RematchDispatch } from '@rematch/core';
import { RootModel } from '@/types/RootModel';
import { models } from './store/models';

import type { UIState } from './store/models/uiState';
import type { SettingsState } from './store/models/settings';
import type { TokenState } from './store/models/tokenState';
import type { InspectState } from './store/models/inspectState';
import type { BranchState } from './store/models/branchState';

export const store = init({
  models,
  redux: {
    devtoolOptions: {},
    rootReducers: { RESET_APP: () => undefined },
  },
});

export type Store = typeof store;
export type Dispatch = RematchDispatch<RootModel>;
export type RootState = {
  uiState: UIState
  settings: SettingsState
  tokenState: TokenState
  inspectState: InspectState;
  branchState: BranchState;
};
