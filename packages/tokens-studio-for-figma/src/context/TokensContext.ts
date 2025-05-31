import React, { createContext, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ResolveTokenValuesResult, mergeTokenGroups } from '@/utils/tokenHelpers';
import { defaultTokenResolver } from '@/utils/TokenResolver';
import { tokensSelector, usedTokenSetSelector, activeTokenSetSelector } from '@/selectors';

export type TokensContextValue = {
  resolvedTokens: ResolveTokenValuesResult[];
};

export const TokensContext = createContext<TokensContextValue>({
  resolvedTokens: [],
});

interface TokensContextProviderProps {
  children: React.ReactNode;
}

export const TokensContextProvider: React.FC<TokensContextProviderProps> = ({ children }) => {
  const tokens = useSelector(tokensSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const activeTokenSet = useSelector(activeTokenSetSelector);

  const resolvedTokens = useMemo(
    () => defaultTokenResolver.setTokens(mergeTokenGroups(tokens, usedTokenSet, {}, activeTokenSet)),
    [tokens, usedTokenSet, activeTokenSet],
  );

  const contextValue = useMemo(() => ({
    resolvedTokens,
  }), [resolvedTokens]);

  return (
    <TokensContext.Provider value={contextValue}>
      {children}
    </TokensContext.Provider>
  );
};
