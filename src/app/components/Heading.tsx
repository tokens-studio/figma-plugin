import * as React from 'react';
import { styled } from '@/stitches.config';

const StyledHeading = styled('div', {
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
  },
});

type HeadingProps = {
  size?: 'small' | 'medium';
  children: React.ReactNode;
  id?: string;
};

function Heading({
  size = 'small', children, id,
}: HeadingProps) {
  return (
    <StyledHeading size={size} data-cy={id}>
      {children}
    </StyledHeading>
  );
}

export default Heading;
