import * as SwitchPrimitive from '@radix-ui/react-switch';
import { styled } from '@/stitches.config';

const StyledSwitch = styled(SwitchPrimitive.Root, {
  all: 'unset',
  width: 24,
  height: 13,
  backgroundColor: 'transparent',
  borderRadius: '9999px',
  position: 'relative',
  border: '1px solid $colors$borderSwitch',
  '&[data-state="checked"]': { backgroundColor: '$bgSwitchChecked' },
});

const StyledThumb = styled(SwitchPrimitive.Thumb, {
  display: 'block',
  width: 13,
  height: 13,
  backgroundColor: '$fgDefault',
  borderRadius: '9999px',
  transition: 'transform 100ms',
  willChange: 'transform',
  boxShadow: '0 0 0 1px $colors$borderSwitch',
  '&[data-state="checked"]': { transform: 'translateX(12px)' },
});

// Exports
export const Switch = StyledSwitch;
export const SwitchThumb = StyledThumb;
