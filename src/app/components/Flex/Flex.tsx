import { styled } from '@/stitches.config';

export const Flex = styled('div', {
  display: 'flex',
  variants: {
    justifyContent: {
      center: { justifyContent: 'center' },
      start: { justifyContent: 'flex-start' },
      end: { justifyContent: 'flex-end' },
      between: { justifyContent: 'space-between' },
      around: { justifyContent: 'space-around' },
    },
    alignItems: {
      center: { alignItems: 'center' },
      start: { alignItems: 'flex-start' },
      end: { alignItems: 'flex-end' },
    },
  },
});
