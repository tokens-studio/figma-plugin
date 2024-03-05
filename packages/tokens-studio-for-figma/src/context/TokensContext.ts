import { createContext } from 'react';
import { ResolveTokenValuesResult } from '@/utils/tokenHelpers';

export type TokensContextValue = {
  resolvedTokens: ResolveTokenValuesResult[];
};

export const TokensContext = createContext<TokensContextValue>({
  resolvedTokens: [],
});
