import { createModel } from '@rematch/core';
import { RootModel } from '@/types/RootModel';

export interface InspectState {
  selectedTokens: string[]
  isShowBrokenReferences: boolean,
  isShowResolvedReferences: boolean,
}

export const inspectState = createModel<RootModel>()({
  state: {
    selectedTokens: [],
    isShowBrokenReferences: true,
    isShowResolvedReferences: true,
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
    toggleShowBrokenReferences: (state, payload: boolean) => ({
      ...state,
      isShowBrokenReferences: payload,
    }),
    toggleShowResolvedReferences: (state, payload: boolean) => ({
      ...state,
      isShowResolvedReferences: payload,
    }),
  },
});
