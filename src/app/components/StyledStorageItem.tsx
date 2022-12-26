import { styled } from '@/stitches.config';

export const StyledStorageItem = styled('div', {
  border: '1px solid',
  padding: '$3',
  textAlign: 'left',
  display: 'flex',
  width: '100%',
  flexDirection: 'row',
  justifyContent: 'space-between',
  borderRadius: '$card',
  alignItems: 'center',
  variants: {
    active: {
      true: {
        borderColor: '$borderAccent',
        backgroundColor: '$bgAccent',
      },
      false: {
        borderColor: '$borderMuted',
        backgroundColor: 'transparent',
      },
    },
  },
});
