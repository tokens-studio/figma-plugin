import React from 'react';
import { useSelector } from 'react-redux';
import { styled } from '@/stitches.config';
import { licenseKeySelector } from '@/selectors/licenseKeySelector';
import { licenseKeyErrorSelector } from '@/selectors/licenseKeyErrorSelector';

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
  const existingKey = useSelector(licenseKeySelector);
  const licenseKeyError = useSelector(licenseKeyErrorSelector);

  return (
    <StyledProBadge href="https://tokens.studio" target="_blank">{(existingKey && !licenseKeyError) || compact ? 'Pro' : 'Get Pro'}</StyledProBadge>
  );
}
