import React from 'react';
import { SingleToken } from '@/types/tokens';
import { TokenTooltipContentValue } from './TokenTooltipContentValue';
import Box from '../Box';
import Stack from '../Stack';

type Props = {
  token: SingleToken;
};

export const TokenTooltipContent: React.FC<Props> = ({ token }) => (
  <Stack direction="column" gap={1} css={{ background: '$bgToolTip' }}>
    <Box
      css={{
        fontSize: '$0',
        fontWeight: '$bold',
        color: '$fgToolTip',
        position: 'relative',
      }}
    >
      {token.name.split('.')[token.name.split('.').length - 1]}
    </Box>
    <Stack direction="column" align="start" gap={2} wrap>
      <TokenTooltipContentValue token={token} />
    </Stack>
    {token.description && <Box css={{ color: '$fgToolTipMuted', padding: '$1 $2' }}>{token.description}</Box>}
  </Stack>
);
