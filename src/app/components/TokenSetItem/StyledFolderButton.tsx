import { styled } from '@/stitches.config';

export const StyledFolderButton = styled('button', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  height: '100%',
  width: '$4',
  '&:focus': {
    boxShadow: 'none',
  },
});
