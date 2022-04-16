import type { ContextObject } from './api';
import { ThemeObjectsMap } from './ThemeObjectsMap';
import type { SingleToken } from './tokens';

export type UpdateRemoteFunctionPayload = {
  tokens: Record<string, SingleToken[]>
  themes: ThemeObjectsMap
  context: ContextObject
  updatedAt?: string
  oldUpdatedAt?: string | null
};
export type UpdateRemoteFunction = (payload: UpdateRemoteFunctionPayload) => Promise<void>;
