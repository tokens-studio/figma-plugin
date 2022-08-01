import React, {
  ForwardedRef, ComponentProps, forwardRef, useMemo,
} from 'react';
import Box from '../Box';
import { StitchesCSS } from '@/types';
import { lightOrDark } from '@/utils/color';
import { theme } from '@/stitches.config';

type Props = Omit<ComponentProps<typeof Box>, 'css'> & {
  css?: StitchesCSS
  color: string
};

function ColorDisplayBubbleComponent({
  css, color, style, ...props
}: Props, ref: ForwardedRef<HTMLDivElement>) {
  const borderColor = useMemo(() => (
    lightOrDark(String(color)) === 'light' ? String(theme.colors.border) : String(theme.colors.borderMuted)
  ), [color]);

  return (
    <Box
      ref={ref}
      css={{
        backgroundColor: 'var(--backgroundColor)',
        borderRadius: '$full',
        border: '1px solid var(--borderColor)',
        width: '1.5rem',
        height: '1.5rem',
        ...css,
      }}
      style={{
        '--backgroundColor': color,
        '--borderColor': borderColor,
        ...style,
      }}
      {...props}
    />
  );
}

export const ColorDisplayBubble = forwardRef(ColorDisplayBubbleComponent);
