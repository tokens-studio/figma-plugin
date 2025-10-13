import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
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
import { TokensContext } from '@/context';
import { aliasBaseFontSizeSelector } from '@/selectors';
import { getAliasValue } from '@/utils/alias';
import { formatTokenValueForDisplay } from '@/utils/displayTokenValue';

type Props = {
  name: string;
  value: SingleToken['value']
  rawValue?: Partial<Record<TokenTypes, string | number | TokenTypographyValue | TokenBoxshadowValue | TokenBorderValue | TokenBoxshadowValue[]>>
  type: string;
};

export default function InspectorResolvedToken({ token }: { token: Props }) {
  const { t } = useTranslation(['inspect']);
  const tokensContext = useContext(TokensContext);
  const aliasBaseFontSize = useSelector(aliasBaseFontSizeSelector);
  
  // Get the current resolved base font size for rem conversion
  const currentBaseFontSize = React.useMemo(() => {
    if (aliasBaseFontSize) {
      const resolvedBaseFontSize = getAliasValue(aliasBaseFontSize, tokensContext.resolvedTokens);
      return resolvedBaseFontSize ? String(resolvedBaseFontSize) : '16px';
    }
    return '16px';
  }, [aliasBaseFontSize, tokensContext.resolvedTokens]);
  
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
      return (
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
      );
    }
    case TokenTypes.TYPOGRAPHY: {
      return (
        <Box
          css={{
            background: '$bgSubtle',
            fontSize: '$small',
            padding: '$2 $3',
            borderRadius: '$small',
            width: '40px',
          }}
        >
          Aa
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
            borderRadius: '$small',
            width: '40px',
          }}
        >
          <IconShadow />
        </Box>
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
      return (
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
      );
    }

    case TokenTypes.BORDER: {
      return (
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
      );
    }

    default: {
      return (
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
          {formatTokenValueForDisplay(token.value, currentBaseFontSize)}
        </Box>
      );
    }
  }
}
