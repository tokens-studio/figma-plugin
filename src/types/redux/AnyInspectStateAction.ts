import { RootModel } from '../RootModel';

export type AnyInspectStateAction<GlobalScope = false> = {
  [K in keyof RootModel['inspectState']['reducers']]: {
    type: GlobalScope extends true ? `inspectState/${K}` : K
    payload: Parameters<RootModel['inspectState']['reducers'][K]>[1]
  }
}[keyof RootModel['inspectState']['reducers']];
