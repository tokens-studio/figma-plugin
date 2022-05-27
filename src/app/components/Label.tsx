import React, { ReactNode } from 'react';
import { styled } from '@/stitches.config';
import type { StitchesCSS } from '@/types';

export default function Label({
  htmlFor,
  children,
  disabled = false,
  css,
}: {
  htmlFor: string;
  children: ReactNode;
  disabled?: boolean;
  css?: StitchesCSS;
}) {
  const StyledLabel = styled('label', {
    fontSize: '$small',
    lineHeight: 1,
    userSelect: 'none',
    variants: {
      isDisabled: {
        true: {
          color: '$textDisabled',
        },
        false: {
          color: '$text',
        },
      },
    },
  });

  return (
    <StyledLabel isDisabled={disabled} css={css} htmlFor={htmlFor}>
      {children}
    </StyledLabel>
  );
}
