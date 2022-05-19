import { styled } from '@/stitches.config';

export const StyledButtonIconContainer = styled('span', {
  display: 'inline-block',
  marginRight: '$3',
  height: 0,
  verticalAlign: 'middle',
  svg: {
    display: 'flex',
    alignItems: 'center',
    transform: 'translateY(-50%)',
  },
});
