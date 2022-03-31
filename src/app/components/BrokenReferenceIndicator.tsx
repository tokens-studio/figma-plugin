import React from 'react';
import { styled } from '@/stitches.config';
import IconBrokenLink from './icons/IconBrokenLink';
import { SingleToken } from '@/types/tokens';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';

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
  resolvedTokens: ResolveTokenValuesResult[];
};

export default function BrokenReferenceIndicator({ token, resolvedTokens }: Props) {
  const failedToResolve = React.useMemo(() => (
    resolvedTokens.find((t) => t.name === token.name)?.failedToResolve
  ), [token, resolvedTokens]);

  if (failedToResolve) {
    return (
      <StyledIndicator>
        <IconBrokenLink />
      </StyledIndicator>
    );
  }
  return null;
}
