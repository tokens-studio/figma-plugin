import * as SwitchPrimitive from '@radix-ui/react-switch';
import { styled } from '@/stitches.config';

const StyledSwitch = styled(SwitchPrimitive.Root, {
  all: 'unset',
  width: 24,
  height: 13,
  backgroundColor: 'transparent',
  borderRadius: '$full',
  position: 'relative',
  border: '1px solid $colors$borderDefault',
  '&[data-state="checked"]': { backgroundColor: '$accentDefault' },
});

const StyledThumb = styled(SwitchPrimitive.Thumb, {
  display: 'block',
  width: 13,
  height: 13,
  backgroundColor: '$fgOnEmphasis',
  borderRadius: '$full',
  transition: 'transform 100ms',
  willChange: 'transform',
  boxShadow: '0 0 0 1px $colors$borderDefault',
  '&[data-state="checked"]': { transform: 'translateX(12px)' },
});

// Exports
export const Switch = StyledSwitch;
export const SwitchThumb = StyledThumb;
