import React from 'react';
import { TokenGradientValue } from '@/types/values';
import { gradientTokenSummary, isGradientTokenValue } from '@/utils/color';
import TooltipProperty from './TooltipProperty';
import Stack from '../Stack';

type Props = {
  value: TokenGradientValue | string;
  resolvedValue: TokenGradientValue | string;
};

export const SingleGradientValueDisplay: React.FC<React.PropsWithChildren<React.PropsWithChildren<Props>>> = ({ value, resolvedValue }) => {
  const previewValue = React.useMemo(() => {
    if (isGradientTokenValue(resolvedValue)) return resolvedValue;
    if (isGradientTokenValue(value)) return value;
    return null;
  }, [resolvedValue, value]);

  return (
    <Stack direction="column" align="start" gap={1}>
      {typeof value === 'string' && <TooltipProperty value={value} />}
      {previewValue && (
        <TooltipProperty value={gradientTokenSummary(previewValue)} />
      )}
    </Stack>
  );
};
