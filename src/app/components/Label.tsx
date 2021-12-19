import React, { ReactNode } from 'react';
import { styled } from '@/stitches.config';

export default function Label({ htmlFor, children, css }: { htmlFor: string; children: ReactNode; css?: object }) {
  const StyledLabel = styled('label', {
    color: '$text',
    fontSize: 12,
    lineHeight: 1,
    userSelect: 'none',
  });
  return (
    <StyledLabel css={css} htmlFor={htmlFor}>
      {children}
    </StyledLabel>
  );
}
