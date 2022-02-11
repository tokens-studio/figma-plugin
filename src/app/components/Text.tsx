import React from 'react';
import { styled } from '@/stitches.config';

const StyledText = styled('div', {
  lineHeight: '$default',
  variants: {
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
  css?: object;
  children?: React.ReactNode;
  muted?: boolean;
  size?: 'xsmall' | 'small' | 'medium' | 'large';
};

const Text: React.FC<TextProps> = ({
  css, children, muted, size = 'small',
}) => <StyledText css={css} muted={muted} size={size}>{children}</StyledText>;

export default Text;
