import type { Models } from '@rematch/core';
import type { settings } from '@/app/store/models/settings';
import type { uiState } from '@/app/store/models/uiState';
import type { tokenState } from '@/app/store/models/tokenState';
import type { inspectState } from '@/app/store/models/inspectState';
import type { branchState } from '@/app/store/models/branchState';

export interface RootModel extends Models<RootModel> {
  settings: typeof settings;
  uiState: typeof uiState;
  tokenState: typeof tokenState;
  inspectState: typeof inspectState;
  branchState: typeof branchState;
}
