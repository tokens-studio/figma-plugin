import { RootModel } from '../RootModel';
import { ActionMeta } from './ActionMeta';

export type AnyTokenStateAction<GlobalScope = false> = {
  [K in keyof RootModel['tokenState']['reducers']]: {
    type: GlobalScope extends true ? `tokenState/${K}` : K
    payload: Parameters<RootModel['tokenState']['reducers'][K]>[1]
    meta?: ActionMeta
  }
}[keyof RootModel['tokenState']['reducers']];
