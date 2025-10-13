import React, { useContext } from 'react';
import { isEqual } from '@/utils/isEqual';
import { useSelector } from 'react-redux';
import Box from '../Box';
import Stack from '../Stack';
import AliasBadge from './AliasBadge';
import { TokensContext } from '@/context';
import { aliasBaseFontSizeSelector } from '@/selectors';
import { getAliasValue } from '@/utils/alias';
import { formatTokenValueForDisplay } from '@/utils/displayTokenValue';

type Props = {
  label?: string;
  value?: string | number;
  resolvedValue?: string | number | null;
};

export default function TooltipProperty({ label, value, resolvedValue }: Props) {
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
  return typeof value !== 'undefined' || typeof resolvedValue !== 'undefined' ? (
    <Stack
      direction="row"
      align="center"
      css={{
        borderRadius: '$medium',
        backgroundColor: '$tooltipBgSubtle',
        overflow: 'hidden',
        display: 'inline-flex',
      }}
    >
      {(label || typeof value !== 'undefined') && (
        <Stack direction="row" align="center" gap={2} css={{ padding: '$1 $2', color: '$tooltipFg' }}>
          {label}
          {typeof value !== 'undefined' && (
            <Box css={{ color: '$tooltipFgMuted', flexShrink: 1, wordBreak: 'break-word' }}>
              {formatTokenValueForDisplay(value, currentBaseFontSize)}
            </Box>
          )}
        </Stack>
      )}
      {typeof resolvedValue !== 'undefined' && !isEqual(String(resolvedValue), String(value)) && typeof resolvedValue !== 'object' ? <AliasBadge value={resolvedValue} /> : null}
    </Stack>
  ) : null;
}
