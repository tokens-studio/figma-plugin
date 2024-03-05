import { styled } from '@/stitches.config';

export const ModalFooter = styled('footer', {
  padding: '$4',
  borderTopColor: '$borderMuted',
  borderTopWidth: '1px',
  variants: {
    stickyFooter: {
      true: {
        backgroundColor: '$bgDefault',
        position: 'sticky',
        left: 0,
        right: 0,
        bottom: -0.5,
        zIndex: 1,
      },
    },
    fullscreen: {
      true: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1,
      },
    },
  },
});
