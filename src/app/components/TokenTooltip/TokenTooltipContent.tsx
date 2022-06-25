import React from 'react';
import { SingleToken } from '@/types/tokens';
import { TokenTooltipContentValue } from './TokenTooltipContentValue';
import Box from '../Box';
import BrokenReferenceIndicator from '../BrokenReferenceIndicator';

type Props = {
  token: SingleToken;
};

export const TokenTooltipContent: React.FC<Props> = ({ token }) => (
  <div>
    <Box css={{
      fontSize: '$0', fontWeight: '$bold', color: '$fgToolTip', position: 'relative',
    }}
    >
      {token.name.split('.')[token.name.split('.').length - 1]}
    </Box>
    <TokenTooltipContentValue token={token} />
    <BrokenReferenceIndicator token={token} />
    {token.description && <Box css={{ color: '$fgToolTipMuted' }}>{token.description}</Box>}
  </div>
);
