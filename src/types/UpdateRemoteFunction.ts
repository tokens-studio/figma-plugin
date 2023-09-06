import { Dispatch } from '@/app/store';
import type { StorageTypeCredentials } from './StorageType';
import { ThemeObjectsList } from './ThemeObjectsList';
import type { SingleToken } from './tokens';

export type UpdateRemoteFunctionPayload = {
  tokens: Record<string, SingleToken[]>
  themes: ThemeObjectsList
  context: Partial<StorageTypeCredentials>
  updatedAt?: string
  oldUpdatedAt?: string | null
  storeTokenIdInJsonEditor: boolean
  dispatch: Dispatch
};
export type UpdateRemoteFunction = (payload: UpdateRemoteFunctionPayload) => Promise<void>;
