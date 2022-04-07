import React from 'react';
import { styled } from '@/stitches.config';

type Props = React.SVGAttributes<SVGSVGElement>;

export const IconToggleableDisclosure = styled(
  (props: Props) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path fillRule="evenodd" clipRule="evenodd" d="M7.646 9.708L4.646 6.708L5.354 6L8 8.647L10.646 6L11.354 6.708L8.354 9.708L8 10.061L7.646 9.708Z" fill="currentColor" />
    </svg>
  ),
  {
    transition: 'transform 0.2s ease-in-out',
    variants: {
      open: {
        true: {
          transform: 'rotate(0deg)',
        },
        false: {
          transform: 'rotate(180deg)',
        },
      },
    },
  },
);
