import { styled } from '@/stitches.config';

export const StyledUnlinkButton = styled('button', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '$fgDanger',
  padding: '$2',
  width: '1.2rem',
  height: '1.2rem',
  borderRadius: '$button',
  backgroundColor: '$bgDanger',
  '&:hover': {
    color: '$bgDanger',
    backgroundColor: '$dangerBgHover',
  },
});
