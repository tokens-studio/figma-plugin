import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { styled } from '@/stitches.config';
import { TokensContext } from '@/context';
import { aliasBaseFontSizeSelector } from '@/selectors';
import { getAliasValue } from '@/utils/alias';
import { formatTokenValueForDisplay } from '@/utils/displayTokenValue';

const StyledAliasBadge = styled('div', {
  padding: '$1 $2',
  backgroundColor: '$tooltipBgAccent',
  color: '$tooltipFgAccent',
  height: '100%',
  wordBreak: 'break-word',
  flexShrink: 1,
});

type Props = {
  value: string | number | null;
};

export default function AliasBadge({ value }: Props) {
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

  return (
    <StyledAliasBadge>
      {formatTokenValueForDisplay(value || '', currentBaseFontSize)}
    </StyledAliasBadge>
  );
}
