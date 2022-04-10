import { RootModel } from '../RootModel';

export type AnySettingsStateAction<GlobalScope = false> = {
  [K in keyof RootModel['settings']['reducers']]: {
    type: GlobalScope extends true ? `settings/${K}` : K
    payload: Parameters<RootModel['settings']['reducers'][K]>[1]
  }
}[keyof RootModel['settings']['reducers']];
