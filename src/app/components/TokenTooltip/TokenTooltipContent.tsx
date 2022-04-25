import React from 'react';
import { SingleToken } from '@/types/tokens';
import useTokens from '@/app/store/useTokens';
import { TokensContext } from '@/context';
import { TokenTooltipContentValue } from './TokenTooltipContentValue';

type Props = {
  token: SingleToken;
};

export const TokenTooltipContent: React.FC<Props> = ({ token }) => {
  const tokensContext = React.useContext(TokensContext);
  const { isAlias } = useTokens();
  const tokenIsAlias = React.useMemo(() => (
    isAlias(token, tokensContext.resolvedTokens)
  ), [token, isAlias, tokensContext.resolvedTokens]);
  return (
    <div>
      <div className="text-xs font-bold text-gray-500">
        {token.name.split('.')[token.name.split('.').length - 1]}
      </div>
      <TokenTooltipContentValue token={token} />
      {tokenIsAlias && (
        <div className="text-gray-400">
          <TokenTooltipContentValue token={token} shouldResolve />
        </div>
      )}
      {token.description && <div className="text-gray-500">{token.description}</div>}
    </div>
  );
};
