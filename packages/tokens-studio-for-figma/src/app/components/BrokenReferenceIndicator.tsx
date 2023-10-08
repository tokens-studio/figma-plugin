import React from 'react';
import { SingleToken } from '@/types/tokens';
import { TokensContext } from '@/context';
import StyledBrokenReferenceIndicator from './StyledBrokenReferenceIndicator';

type Props = {
  token: SingleToken;
};

export default function BrokenReferenceIndicator({ token }: Props) {
  const tokensContext = React.useContext(TokensContext);

  const failedToResolve = React.useMemo(() => (
    tokensContext.resolvedTokens.find((t) => t.name === token.name)?.failedToResolve
  ), [token, tokensContext.resolvedTokens]);

  if (failedToResolve) {
    return (
      <StyledBrokenReferenceIndicator />
    );
  }
  return null;
}
