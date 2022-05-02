import React from 'react';
import { styled } from '@/stitches.config';

const StyledText = styled('div', {
  lineHeight: '$default',
  variants: {
    bold: {
      true: {
        fontWeight: '$bold',
      },
    },
    size: {
      xsmall: {
        fontSize: '$xsmall',
      },
      small: {
        fontSize: '$small',
      },
    },
    muted: {
      true: {
        color: '$textMuted',
      },
      false: {
        color: '$text',
      },
    },
  },
});

type TextProps = Omit<React.ComponentProps<typeof StyledText>, 'muted' | 'bold' | 'size'> & {
  children: React.ReactNode;
  muted?: boolean;
  bold?: boolean;
  size?: 'xsmall' | 'small';
};

const Text: React.FC<TextProps> = ({
  children, muted, bold, size = 'small', ...props
}) => (
  <StyledText muted={muted} size={size} bold={bold} {...props}>
    {children}
  </StyledText>
);

export default Text;
