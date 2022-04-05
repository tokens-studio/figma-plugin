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
    },
    width: {
      full: {
        width: '100%',
      },
    },
  },
});

type StackProps = {
  gap?: 0 | 1 | 2 | 3 | 4;
  direction: 'row' | 'column';
  align?: 'center' | 'start' | 'end';
  justify?: 'center' | 'start' | 'end' | 'between';
  width?: 'full';
  children: React.ReactNode;
  css?: Stitches.CSS
};

export default function Stack({
  gap, direction, align, justify, width, children, css,
}: StackProps) {
  return (
    <StyledStack gap={gap} direction={direction} align={align} justify={justify} width={width} css={css}>
      {children}
    </StyledStack>
  );
}
