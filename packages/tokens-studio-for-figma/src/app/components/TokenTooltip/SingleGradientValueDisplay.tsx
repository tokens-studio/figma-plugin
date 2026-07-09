import React from 'react';
import { useUIDSeed } from 'react-uid';
import { TokenGradientValue } from '@/types/values';
import { gradientTokenToCss, gradientTokenSummary, isGradientTokenValue } from '@/utils/color';
import TooltipProperty from './TooltipProperty';
import Stack from '../Stack';
import Box from '../Box';

type Props = {
  value: TokenGradientValue | string;
  resolvedValue: TokenGradientValue | string;
};

export const SingleGradientValueDisplay: React.FC<React.PropsWithChildren<React.PropsWithChildren<Props>>> = ({ value, resolvedValue }) => {
  const seed = useUIDSeed();
  const previewValue = React.useMemo(() => {
    if (isGradientTokenValue(resolvedValue)) return resolvedValue;
    if (isGradientTokenValue(value)) return value;
    return null;
  }, [resolvedValue, value]);

  return (
    <Stack direction="column" align="start" gap={1}>
      {typeof value === 'string' && <TooltipProperty value={value} />}
      {previewValue && (
        <>
          <Box
            css={{
              width: '100%',
              minWidth: '150px',
              height: '$5',
              borderRadius: '$small',
              border: '1px solid $borderMuted',
            }}
            style={{ background: gradientTokenToCss(previewValue) }}
          />
          <TooltipProperty value={gradientTokenSummary(previewValue)} />
          {previewValue.stops.map((stop, index) => (
            <TooltipProperty
              key={seed(index)}
              label={`${Math.round(stop.position * 100)}%`}
              value={isGradientTokenValue(value) ? value.stops[index]?.color : stop.color}
              resolvedValue={stop.color}
            />
          ))}
        </>
      )}
    </Stack>
  );
};
