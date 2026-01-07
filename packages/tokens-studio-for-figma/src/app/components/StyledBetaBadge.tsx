import { styled } from '@/stitches.config';

export const StyledBetaBadge = styled('span', {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '$xxsmall',
  padding: '$2',
  borderRadius: '$medium',
  backgroundColor: '$accentBg',
  lineHeight: 1,
  color: '$fgDefault',
  fontWeight: '$sansBold',
  textTransform: 'uppercase',
  border: '1px solid transparent',
});
