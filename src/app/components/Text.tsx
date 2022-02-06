import React from 'react';
import { styled } from '@/stitches.config';

const StyledText = styled('div', {
  fontSize: '$small',
  lineHeight: '$default',
  variants: {
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
  size?: 'small' | 'medium' | 'large';
};

const Text: React.FC<TextProps> = ({
  css, children, muted, size,
}) => <StyledText css={css} muted={muted} size={size}>{children}</StyledText>;

export default Text;
