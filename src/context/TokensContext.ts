import { createContext } from 'react';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';

export type TokensContextValue = {
  resolvedTokens: ResolveTokenValuesResult[];
};

export const TokensContext = createContext<TokensContextValue>({
  resolvedTokens: [],
});
