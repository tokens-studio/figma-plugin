import { styled } from '@/stitches.config';

export const StyledStorageItem = styled('div', {
  border: '1px solid',
  padding: '$3',
  textAlign: 'left',
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
  borderRadius: '$medium',
  variants: {
    active: {
      true: {
        borderColor: '$accentBorder',
        backgroundColor: '$accentBg',
      },
      false: {
        borderColor: '$borderSubtle',
        backgroundColor: 'transparent',
      },
    },
    hasError: {
      true: {
        borderColor: '$dangerBorder',
        backgroundColor: '$dangerBg',
      },
    },
  },
});
