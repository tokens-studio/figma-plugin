import { createModel } from '@rematch/core';
import { RootModel } from '@/types/RootModel';

export interface BranchState {
  branches: string[]
}

export const branchState = createModel<RootModel>()({
  state: {
    branches: [],
  } as BranchState,
  reducers: {
    setBranches: (state, data: string[]) => ({
      ...state,
      branches: data,
    }),
  },
});
