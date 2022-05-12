import { styled } from '@/stitches.config';

export const StyledDropdown = styled('div', {
  position: 'absolute',
  zIndex: '10',
  width: '100%',
  maxHeight: '140px',
  borderRadius: '$contextMenu',
  overflowY: 'scroll',
  backgroundColor: '$contextMenuBackground',
  marginTop: '1px',
  cursor: 'pointer',
  boxShadow: '$contextMenu',
});
