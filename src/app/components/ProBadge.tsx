import React from 'react';
import { useSelector } from 'react-redux';
import { styled } from '@/stitches.config';
import { licenseKeySelector } from '@/selectors/licenseKeySelector';

export const StyledProBadge = styled('a', {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '$xxsmall',
  padding: '$2',
  borderRadius: '$badge',
  backgroundColor: '$bgProSubtle',
  lineHeight: 1,
  color: '$fgDefault',
  fontWeight: '$bold',
  textTransform: 'uppercase',
  border: '1px solid transparent',

  '&:hover, &:focus': {
    borderColor: '$borderPro',
  },
});

export default function ProBadge() {
  const existingKey = useSelector(licenseKeySelector);

  return (
    <StyledProBadge href="https://figmatokens.com" target="_blank">{existingKey ? 'Pro' : 'Get Pro'}</StyledProBadge>
  );
}
