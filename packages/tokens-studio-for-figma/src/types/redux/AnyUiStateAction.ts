import { RootModel } from '../RootModel';
import { ActionMeta } from './ActionMeta';

export type AnyUiStateAction<GlobalScope = false> = {
  [K in keyof RootModel['uiState']['reducers']]: {
    type: GlobalScope extends true ? `uiState/${K}` : K
    payload: Parameters<RootModel['uiState']['reducers'][K]>[1]
    meta?: ActionMeta
  }
}[keyof RootModel['uiState']['reducers']];
