import React from 'react';
import { SingleToken } from '@/types/tokens';
import useTokens from '@/app/store/useTokens';
import { TokensContext } from '@/context';
import { TokenTooltipContentValue } from './TokenTooltipContentValue';
import { TokenTypes } from '@/constants/TokenTypes';
import Box from '../Box';

type Props = {
  token: SingleToken;
};

export const TokenTooltipContent: React.FC<Props> = ({ token }) => {
  const tokensContext = React.useContext(TokensContext);
  const { isAlias } = useTokens();
  const tokenIsAlias = React.useMemo(() => (
    isAlias(token, tokensContext.resolvedTokens)
  ), [token, isAlias, tokensContext.resolvedTokens]);
  const tokenIsShadowOrTypographyAlias = React.useMemo(
    () => (
      token.type === TokenTypes.TYPOGRAPHY || token.type === TokenTypes.BOX_SHADOW)
      && typeof token.value === 'string',
    [token],
  );

  return (
    <div>
      <Box css={{ fontSize: '$0', fontWeight: '$bold', color: '$fgToolTip' }}>
        {token.name.split('.')[token.name.split('.').length - 1]}
      </Box>
      <TokenTooltipContentValue
        token={token}
        shouldResolve={false}
        tokenIsShadowOrTypographyAlias={tokenIsShadowOrTypographyAlias}
      />
      {tokenIsAlias && (
        <Box css={{ color: '$fgToolTipMuted' }}>
          <TokenTooltipContentValue
            token={token}
            shouldResolve
            tokenIsShadowOrTypographyAlias={tokenIsShadowOrTypographyAlias}
          />
        </Box>
      )}
      {token.description && <Box css={{ color: '$fgToolTipMuted' }}>{token.description}</Box>}
    </div>
  );
};
