import React from 'react';
import { styled } from '@/stitches.config';
import { useResolvedBaseFontSize } from '@/app/hooks/useResolvedBaseFontSize';
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
  const currentBaseFontSize = useResolvedBaseFontSize();

  return (
    <StyledAliasBadge>
      {formatTokenValueForDisplay(value || '', currentBaseFontSize)}
    </StyledAliasBadge>
  );
}
