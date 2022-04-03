import React from 'react';
import { styled } from '@/stitches.config';

const StyledText = styled('div', {
  lineHeight: '$default',
  variants: {
    bold: {
      fontWeight: '$bold',
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

type TextProps = {
  children: React.ReactNode;
  muted?: boolean;
  bold?: boolean;
  size?: 'xsmall' | 'small';
};

const Text: React.FC<TextProps> = ({
  children, muted, bold, size = 'small',
}) => (
  <StyledText muted={muted} size={size} bold={bold}>
    {children}
  </StyledText>
);

export default Text;
