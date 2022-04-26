import React, { useEffect } from 'react';
import { SingleToken } from '@/types/tokens';
import useTokens from '@/app/store/useTokens';
import { TokensContext } from '@/context';
import { TokenTooltipContentValue } from './TokenTooltipContentValue';
import { TokenTypes } from '@/constants/TokenTypes';

type Props = {
  token: SingleToken;
};

export const TokenTooltipContent: React.FC<Props> = ({ token }) => {
  const tokensContext = React.useContext(TokensContext);
  const { isAlias } = useTokens();
  useEffect(() => {
  }, [])
  const tokenIsAlias = React.useMemo(() => (
    isAlias(token, tokensContext.resolvedTokens)
  ), [token, isAlias, tokensContext.resolvedTokens]);
  const tokenIsShadowOrTypographyAlias = React.useMemo(() => (
    (token.type === TokenTypes.TYPOGRAPHY || token.type === TokenTypes.BOX_SHADOW) && typeof token.value === 'string'
  ), [token, tokensContext.resolvedTokens]);

  return (
    <div>
      <div className="text-xs font-bold text-gray-500">
        {token.name.split('.')[token.name.split('.').length - 1]}
      </div>
      <TokenTooltipContentValue token={token} />
      {tokenIsAlias && (
        <div className="text-gray-400">
          <TokenTooltipContentValue 
            token={token} 
            shouldResolve 
            tokenIsShadowOrTypographyAlias={tokenIsShadowOrTypographyAlias}
          />
        </div>
      )}
      {token.description && <div className="text-gray-500">{token.description}</div>}
    </div>
  );
};
