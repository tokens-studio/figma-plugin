import { styled } from '@/stitches.config';
import { StyledItemValue } from './StyledItemValue';

export const StyledItem = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  padding: '$2 $3',
  fontSize: '$xsmall',
  variants: {
    isFocused: {
      true: {
        backgroundColor: '$interaction',
        color: '$onInteraction',
        [`& ${StyledItemValue}`]: {
          color: '$onInteraction',
        },
      },
    },
  },
});
