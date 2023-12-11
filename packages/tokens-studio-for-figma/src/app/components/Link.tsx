import React from 'react';
import { styled } from '@/stitches.config';

const StyledLink = styled('a', {
  color: '$accentDefault',
  textDecoration: 'none',
  ':hover': {
    textDecoration: 'underline',
  },
});

type Props = {
  href: string
  children: React.ReactNode
};

export default function Link({ href, children }: Props) {
  return (
    <StyledLink href={href} target="_blank" rel="noreferrer">{children}</StyledLink>
  );
}
