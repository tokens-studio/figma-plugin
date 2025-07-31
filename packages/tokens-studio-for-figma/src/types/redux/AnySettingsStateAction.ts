import { RootModel } from '../RootModel';
import { ActionMeta } from './ActionMeta';

export type AnySettingsStateAction<GlobalScope = false> = {
  [K in keyof RootModel['settings']['reducers']]: {
    type: GlobalScope extends true ? `settings/${K}` : K
    payload: Parameters<RootModel['settings']['reducers'][K]>[1]
    meta?: ActionMeta
  }
}[keyof RootModel['settings']['reducers']];
