import { styled } from '@/stitches.config';

export const StyledDiff = styled(('div'), {
  padding: '$2 $3',
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
