import { styled } from '@/stitches.config';
import Text from './Text';

export const StyledDiff = styled((Text), {
  padding: '$1 $2',
  wordBreak: 'break-all',
  fontWeight: '$bold',
  borderRadius: '$badge',
  fontSize: '$xsmall',
  variants: {
    type: {
      success: {
        backgroundColor: '$bgSuccess',
        color: '$fgSuccess',
      },
      danger: {
        backgroundColor: '$bgDanger',
        color: '$fgDanger',
      },
    },
  },
});
