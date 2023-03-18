import React from 'react';
import Box from './Box';
import Tooltip from './Tooltip';
import IconBrokenLink from '@/icons/brokenlink.svg';
import IconShadow from '@/icons/shadow.svg';
import IconComposition from '@/icons/composition.svg';
import { TokenTypes } from '@/constants/TokenTypes';
import { IconBorder, IconImage } from '@/icons';
import { SingleToken } from '@/types/tokens';

type Props = {
  name: string;
  value: SingleToken['value']
  type: string;
};

export default function InspectorResolvedToken({ token }: { token: Props }) {
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
    case TokenTypes.COLOR: {
      return (
        <Box
          css={{
            background: String(token.value),
            width: '24px',
            height: '24px',
            borderRadius: '100%',
            border: '1px solid $borderMuted',
            fontSize: 0,
          }}
        />
      );
    }
    case TokenTypes.TYPOGRAPHY: {
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
    case TokenTypes.BOX_SHADOW: {
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
    case TokenTypes.COMPOSITION: {
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
          <IconComposition />
        </Box>
      );
    }

    case TokenTypes.ASSET: {
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
          <IconImage />
        </Box>
      );
    }

    case TokenTypes.BORDER: {
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
          <IconBorder />
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
