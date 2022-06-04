import type { StorageTypeCredentials } from './StorageType';
import { ThemeObjectsList } from './ThemeObjectsList';
import type { SingleToken } from './tokens';

export type UpdateRemoteFunctionPayload = {
  tokens: Record<string, SingleToken[]>
  themes: ThemeObjectsList
  context: Partial<StorageTypeCredentials>
  updatedAt?: string
  oldUpdatedAt?: string | null
};
export type UpdateRemoteFunction = (payload: UpdateRemoteFunctionPayload) => Promise<void>;
