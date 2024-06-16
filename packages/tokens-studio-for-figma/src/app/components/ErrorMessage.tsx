import { styled } from '@/stitches.config';

export const ErrorMessage = styled('div', {
  backgroundColor: '$dangerBg',
  border: '1px solid $dangerBorder',
  color: '$dangerFg',
  borderRadius: '$small',
  padding: '$4',
  fontSize: '$xs',
  fontWeight: '$sansBold',
});
