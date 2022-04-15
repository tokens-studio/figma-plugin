import React from 'react';
import { styled } from '@/stitches.config';

const StyledHeading = styled('p', {
  fontWeight: '$bold',
  color: '$text',
  letterSpacing: 0,
  variants: {
    size: {
      small: {
        fontSize: '$small',
      },
      medium: {
        fontSize: '$medium',
      },
    },
    muted: {
      true: {
        color: '$textMuted',
      },
    },
  },
});

type HeadingProps = {
  size?: 'small' | 'medium';
  children: React.ReactNode;
  id?: string;
  muted?: boolean;
};

function Heading({
  size = 'small', children, id, muted,
}: HeadingProps) {
  return (
    <StyledHeading size={size} muted={muted} data-cy={id}>
      {children}
    </StyledHeading>
  );
}

export default Heading;
