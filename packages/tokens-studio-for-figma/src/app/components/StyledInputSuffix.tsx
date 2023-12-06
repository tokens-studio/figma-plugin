import { styled } from '@/stitches.config';
import IconDisclosure from '@/icons/disclosure.svg';

export const StyledIconDisclosure = styled(IconDisclosure, {
  width: '16px',
  height: '16px',
  transition: 'transform 0.2s ease-in-out',
});

export const StyledInputSuffix = styled('button', {
  width: '$controlSmall',
  height: '$controlSmall',
  backgroundColor: '$bgSubtle',
  border: '1px solid',
  borderColor: '$borderMuted',
  borderTopRightRadius: '$small',
  borderBottomRightRadius: '$small',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  '&:focus': {
    outline: 'none',
    backgroundColor: '$accentDefault',
    color: '$fgOnEmphasis',
    boxShadow: 'none',
    borderColor: '$accentDefault',
  },
});
