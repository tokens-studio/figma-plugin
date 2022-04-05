import React from 'react';
import { styled } from '@/stitches.config';
import IconBrokenLink from './icons/IconBrokenLink';
import { SingleToken } from '@/types/tokens';
import { TokensContext } from '@/context';

const StyledIndicator = styled('div', {
  position: 'absolute',
  top: '3px',
  right: '3px',
  borderRadius: '100%',
  border: '1px solid $bgDefault',
  background: '$dangerFg',
  width: '6px',
  height: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

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
      <StyledIndicator>
        <IconBrokenLink />
      </StyledIndicator>
    );
  }
  return null;
}
