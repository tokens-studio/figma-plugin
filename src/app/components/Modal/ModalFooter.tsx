import { styled } from '@/stitches.config';

export const ModalFooter = styled('footer', {
  padding: '$4',
  borderTopColor: '$border',
  borderTopWidth: '1px',
  variants: {
    stickyFooter: {
      true: {
        backgroundColor: '$bgDefault',
        position: 'sticky',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1,
      },
    },
  },
});
