import { init, RematchDispatch } from '@rematch/core';
import { RootModel } from '@/types/RootModel';
import { models } from './store/models';

import type { UIState } from './store/models/uiState';
import type { SettingsState } from './store/models/settings';
import type { TokenState } from './store/models/tokenState';
import { UserState } from './store/models/userState';
import type { InspectState } from './store/models/inspectState';
import type { BranchState } from './store/models/branchState';
import { undoableEnhancer } from './enhancers/undoableEnhancer';

export const store = init({
  models,
  redux: {
    devtoolOptions: {},
    enhancers: [undoableEnhancer],
    rootReducers: {
      RESET_APP: () => undefined,
    },
  },
});

(window as any).store = store;
export type Store = typeof store;
export type Dispatch = RematchDispatch<RootModel>;
export type RootState = {
  uiState: UIState;
  settings: SettingsState;
  tokenState: TokenState;
  inspectState: InspectState;
  userState: UserState;
  branchState: BranchState;
};
