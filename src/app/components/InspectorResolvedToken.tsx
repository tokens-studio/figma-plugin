import React from 'react';
import Box from './Box';
import Tooltip from './Tooltip';
import IconBrokenLink from './icons/IconBrokenLink';
import { SingleToken } from '@/types/tokens';
import IconShadow from '@/icons/shadow.svg';

export default function InspectorResolvedToken({ token }: { token: SingleToken }) {
  // TODO: Introduce shared component for token tooltips
  if (!token) {
    return (
      <Tooltip label="Token not found" side="bottom">
        <Box
          css={{
            width: '24px',
            height: '24px',
            borderRadius: '100%',
            border: '1px solid $borderMuted',
            backgroundColor: '$bgSubtle',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconBrokenLink />
        </Box>
      </Tooltip>
    );
  }
  switch (token?.type) {
    case 'color': {
      return (
        <Box
          css={{
            background: token.value,
            width: '24px',
            height: '24px',
            borderRadius: '100%',
            border: '1px solid $borderMuted',
          }}
        />
      );
    }
    case 'typography': {
      return (
        <Box
          css={{
            background: '$bgSubtle',
            fontSize: '$small',
            padding: '$2 $3',
            borderRadius: '$default',
            width: '40px',
          }}
        >
          aA
        </Box>
      );
    }
    // TODO: Show shadow preview
    case 'boxShadow': {
      return (
        <Box
          css={{
            background: '$bgSubtle',
            fontSize: '$small',
            padding: '$2 $3',
            borderRadius: '$default',
            width: '40px',
          }}
        >
          <IconShadow />
        </Box>
      );
    }
    case 'composition': {
      return (
        <Box
          css={{
            background: '$bgSubtle',
            fontSize: '$small',
            padding: '$2 $3',
            borderRadius: '$default',
            width: '40px',
          }}
        >
          <IconShadow />
        </Box>
      );
    }

    default: {
      return (
        <Box
          css={{
            background: '$bgSubtle',
            fontSize: '$small',
            padding: '$2 $3',
            borderRadius: '$default',
            width: '40px',
            fontFamily: '$mono',
            overflow: 'hidden',
          }}
        >
          {token.value}
        </Box>
      );
    }
  }
}
