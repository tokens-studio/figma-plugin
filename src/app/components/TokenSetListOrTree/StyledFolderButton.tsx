import { styled } from '@/stitches.config';

export const StyledFolderButton = styled('button', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '$5',
  height: '$5',
  flexShrink: 0,
  zIndex: 1,
  '&:focus': {
    boxShadow: 'none',
  },
});
