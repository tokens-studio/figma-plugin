import React from 'react';
import { useSelector } from 'react-redux';
import { styled } from '@/stitches.config';
import { licenseDetailsSelector } from '@/selectors';

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

type Props = {
  compact?: boolean;
};

export default function ProBadge({ compact }: Props) {
  const licenseDetails = useSelector(licenseDetailsSelector);

  return (
    <StyledProBadge href="https://figmatokens.com" target="_blank">{licenseDetails.entitlements.length !== 0 || compact ? 'Pro' : 'Get Pro'}</StyledProBadge>
  );
}
