import { RootModel } from '../RootModel';

export type AnyTokenStateAction<GlobalScope = false> = {
  [K in keyof RootModel['tokenState']['reducers']]: {
    type: GlobalScope extends true ? `tokenState/${K}` : K
    payload: Parameters<RootModel['tokenState']['reducers'][K]>[1]
  }
}[keyof RootModel['tokenState']['reducers']];
