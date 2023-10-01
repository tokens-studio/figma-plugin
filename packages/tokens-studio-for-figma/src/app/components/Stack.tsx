import React from 'react';
import type * as Stitches from '@stitches/react';
import { styled } from '@/stitches.config';

const StyledStack = styled('div', {
  display: 'flex',
  variants: {
    direction: {
      row: {
        flexDirection: 'row',
      },
      column: {
        flexDirection: 'column',
      },
    },
    align: {
      center: {
        alignItems: 'center',
      },
      start: {
        alignItems: 'flex-start',
      },
      end: {
        alignItems: 'flex-end',
      },
    },
    justify: {
      center: {
        justifyContent: 'center',
      },
      start: {
        justifyContent: 'flex-start',
      },
      end: {
        justifyContent: 'flex-end',
      },
      between: {
        justifyContent: 'space-between',
      },
    },
    gap: {
      0: {
        gap: 0,
      },
      1: {
        gap: '$1',
      },
      2: {
        gap: '$2',
      },
      3: {
        gap: '$3',
      },
      4: {
        gap: '$4',
      },
      5: {
        gap: '$5',
      },
      6: {
        gap: '$6',
      },
    },
    width: {
      full: {
        width: '100%',
      },
    },
    wrap: {
      true: {
        flexWrap: 'wrap',
      },
    },
  },
});

type StackProps = React.HTMLAttributes<HTMLDivElement> & {
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  direction: 'row' | 'column';
  align?: 'center' | 'start' | 'end';
  justify?: 'center' | 'start' | 'end' | 'between';
  width?: 'full';
  children: React.ReactNode;
  wrap?: boolean;
  css?: Stitches.CSS;
};

export default function Stack({
  gap, direction, align, justify, width, wrap, children, css, ...props
}: StackProps) {
  return (
    <StyledStack gap={gap} direction={direction} align={align} justify={justify} width={width} css={css} wrap={wrap} {...props}>
      {children}
    </StyledStack>
  );
}
