import React from 'react';
import { SingleToken } from '@/types/tokens';
import { TokenTooltipContentValue } from './TokenTooltipContentValue';
import Box from '../Box';
import Stack from '../Stack';
import { TokensContext } from '@/context';
import NotFoundBadge from './NotFoundBadge';

type Props = {
  token: SingleToken;
};

export const TokenTooltipContent: React.FC<React.PropsWithChildren<React.PropsWithChildren<Props>>> = ({ token }) => {
  const tokensContext = React.useContext(TokensContext);

  const failedToResolve = React.useMemo(() => (
    tokensContext.resolvedTokens.find((t) => t.name === token.name)?.failedToResolve
  ), [token, tokensContext.resolvedTokens]);

  return (
    <Stack direction="column" gap={1} css={{ background: '$tooltipBg', fontSize: '$xsmall' }}>
      <Stack
        direction="row"
        justify="start"
        align="center"
        gap={2}
        css={{
          fontWeight: '$sansBold',
          color: '$tooltipFg',
          position: 'relative',
        }}
      >
        {token.name.split('.')[token.name.split('.').length - 1]}
        {failedToResolve ? <NotFoundBadge /> : null}
      </Stack>

      <Stack direction="column" align="start" gap={2} wrap>
        <TokenTooltipContentValue token={token} />
      </Stack>
      {token.description && <Box css={{ color: '$tooltipFgMuted', padding: '$1 $2' }}>{token.description}</Box>}
    </Stack>
  );
};
