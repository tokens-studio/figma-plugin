import type { ContextObject } from './api';
import { ThemeObjectsList } from './ThemeObjectsList';
import type { SingleToken } from './tokens';

export type UpdateRemoteFunctionPayload = {
  tokens: Record<string, SingleToken[]>
  themes: ThemeObjectsList
  context: ContextObject
  updatedAt?: string
  oldUpdatedAt?: string | null
};
export type UpdateRemoteFunction = (payload: UpdateRemoteFunctionPayload) => Promise<void>;
