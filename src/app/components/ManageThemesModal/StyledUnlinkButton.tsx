import { styled } from '@/stitches.config';

export const StyledUnlinkButton = styled('button', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '$fgDanger',
  padding: '$2',
  borderRadius: '$button',
  '&:hover': {
    color: '$bgDanger',
    backgroundColor: '$dangerBgHover',
  },
});
