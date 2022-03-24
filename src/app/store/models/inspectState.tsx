import { createModel } from '@rematch/core';
import { RootModel } from '@/types/RootModel';

export interface InspectState {
  selectedTokens: string[]
}

export const inspectState = createModel<RootModel>()({
  state: {
    selectedTokens: [],
  } as InspectState,
  reducers: {
    setSelectedTokens: (state, data: string[]) => ({
      ...state,
      selectedTokens: data,
    }),
    toggleSelectedTokens: (state, data: string) => ({
      ...state,
      selectedTokens: state.selectedTokens.includes(data)
        ? state.selectedTokens.filter((token) => token !== data)
        : [...state.selectedTokens, data],
    }),
  },
});
