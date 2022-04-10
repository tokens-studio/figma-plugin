import { RootModel } from '../RootModel';

export type AnyUiStateAction<GlobalScope = false> = {
  [K in keyof RootModel['uiState']['reducers']]: {
    type: GlobalScope extends true ? `uiState/${K}` : K
    payload: Parameters<RootModel['uiState']['reducers'][K]>[1]
  }
}[keyof RootModel['uiState']['reducers']];
