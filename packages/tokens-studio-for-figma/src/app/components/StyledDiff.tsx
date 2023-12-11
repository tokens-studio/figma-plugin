import { styled } from '@/stitches.config';
import Text from './Text';

export const StyledDiff = styled((Text), {
  padding: '$1 $2',
  wordBreak: 'break-all',
  fontWeight: '$sansBold',
  borderRadius: '$medium',
  fontSize: '$xsmall',
  variants: {
    type: {
      success: {
        backgroundColor: '$successBg',
        color: '$successFg',
      },
      danger: {
        backgroundColor: '$dangerBg',
        color: '$dangerFg',
      },
    },
  },
});
