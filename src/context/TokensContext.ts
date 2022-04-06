import { createContext } from 'react';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';

type Value = {
  resolvedTokens: ResolveTokenValuesResult[];
};

export const TokensContext = createContext<Value>({
  resolvedTokens: [],
});
