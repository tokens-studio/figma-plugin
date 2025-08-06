import React from 'react';
import { useTranslation } from 'react-i18next';
import Box from './Box';
import Tooltip from './Tooltip';
import IconBrokenLink from '@/icons/brokenlink.svg';
import IconShadow from '@/icons/shadow.svg';
import IconComposition from '@/icons/composition.svg';
import { TokenTypes } from '@/constants/TokenTypes';
import { IconBorder, IconImage } from '@/icons';
import { SingleToken } from '@/types/tokens';
import { TokenTooltip } from './TokenTooltip';
import { TokenTypographyValue, TokenBoxshadowValue, TokenBorderValue } from '@/types/values';

type Props = {
  name: string;
  value: SingleToken['value']
  rawValue?: Partial<Record<TokenTypes, string | number | TokenTypographyValue | TokenBoxshadowValue | TokenBorderValue | TokenBoxshadowValue[]>>
  type: string;
};

export default function InspectorResolvedToken({ token }: { token: Props }) {
  const { t } = useTranslation(['inspect']);
  // TODO: Introduce shared component for token tooltips
  if (!token) {
    return (
      <Tooltip label={t('tokenNotFound')} side="bottom">
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
      const colorToken = {
        name: token.name,
        type: TokenTypes.COLOR,
        value: token.value,
      } as SingleToken;
      return (
        <TokenTooltip token={colorToken}>
          <Box
            css={{
              background: String(token.value),
              width: '24px',
              height: '24px',
              borderRadius: '100%',
              border: '1px solid $borderMuted',
              fontSize: 0,
              flexShrink: 0,
            }}
          />
        </TokenTooltip>
      );
    }
    case TokenTypes.TYPOGRAPHY: {
      const typographyToken = {
        name: token.name,
        type: TokenTypes.TYPOGRAPHY,
        value: token.value,
      } as SingleToken;
      return (
        <TokenTooltip token={typographyToken}>
          <Box
            css={{
              background: '$bgSubtle',
              fontSize: '$small',
              padding: '$2 $3',
              borderRadius: '$small',
              width: '40px',
            }}
          >
            aA
          </Box>
        </TokenTooltip>
      );
    }
    // TODO: Show shadow preview
    case TokenTypes.BOX_SHADOW: {
      const shadowToken = {
        name: token.name,
        type: TokenTypes.BOX_SHADOW,
        value: token.value,
      } as SingleToken;
      return (
        <TokenTooltip token={shadowToken}>
          <Box
            css={{
              background: '$bgSubtle',
              fontSize: '$small',
              padding: '$2 $3',
              borderRadius: '$small',
              width: '40px',
            }}
          >
            <IconShadow />
          </Box>
        </TokenTooltip>
      );
    }
    case TokenTypes.COMPOSITION: {
      let compositionToken: SingleToken = {} as SingleToken;
      if (token.rawValue) {
        compositionToken = {
          name: token.name,
          type: token.type,
          value: token.rawValue,
        };
      }

      return (
        <TokenTooltip token={compositionToken}>
          <Box
            css={{
              background: '$bgSubtle',
              fontSize: '$small',
              padding: '$2 $3',
              borderRadius: '$small',
              width: '40px',
            }}
          >
            <IconComposition />
          </Box>
        </TokenTooltip>
      );
    }

    case TokenTypes.ASSET: {
      const assetToken = {
        name: token.name,
        type: TokenTypes.ASSET,
        value: token.value,
      } as SingleToken;
      return (
        <TokenTooltip token={assetToken}>
          <Box
            css={{
              background: '$bgSubtle',
              fontSize: '$small',
              padding: '$2 $3',
              borderRadius: '$small',
              width: '40px',
            }}
          >
            <IconImage />
          </Box>
        </TokenTooltip>
      );
    }

    case TokenTypes.BORDER: {
      const borderToken = {
        name: token.name,
        type: TokenTypes.BORDER,
        value: token.value,
      } as SingleToken;
      return (
        <TokenTooltip token={borderToken}>
          <Box
            css={{
              background: '$bgSubtle',
              fontSize: '$small',
              padding: '$2 $3',
              borderRadius: '$small',
              width: '40px',
            }}
          >
            <IconBorder />
          </Box>
        </TokenTooltip>
      );
    }

    default: {
      const defaultToken = {
        name: token.name,
        type: TokenTypes.OTHER,
        value: token.value,
      } as SingleToken;
      return (
        <TokenTooltip token={defaultToken}>
          <Box
            css={{
              background: '$bgSubtle',
              fontSize: '$small',
              padding: '$2 $3',
              borderRadius: '$small',
              width: '40px',
              fontFamily: '$mono',
              overflow: 'hidden',
            }}
          >
            {String(token.value)}
          </Box>
        </TokenTooltip>
      );
    }
  }
}
