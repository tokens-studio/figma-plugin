import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { CheckIcon } from '@radix-ui/react-icons';
import React from 'react';
import { styled } from '@/stitches.config';

const StyledIndicator = styled(CheckboxPrimitive.Indicator, {
  color: '$onInteraction',
});

const StyledCheckbox = styled(CheckboxPrimitive.Root, {
  all: 'unset',
  backgroundColor: '$bgDefault',
  width: 16,
  height: 16,
  borderRadius: '$input',
  border: '1px solid $interaction',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&:focus': { boxShadow: '0 0 0 2px black' },

  variants: {
    checked: {
      true: {
        backgroundColor: '$interaction',
        borderColor: '$interaction',
      },
    },
  },
});

function Checkbox({
  checked,
  id = null,
  onCheckedChange,
  defaultChecked = false,
  disabled = false,
}: {
  checked: boolean;
  id: string;
  onCheckedChange: any;
  defaultChecked: boolean;
  disabled?: boolean;
}) {
  return (
    <StyledCheckbox
      id={id}
      disabled={disabled}
      checked={checked}
      onCheckedChange={onCheckedChange}
      defaultChecked={defaultChecked}
    >
      <StyledIndicator>
        <CheckIcon />
      </StyledIndicator>
    </StyledCheckbox>
  );
}

export default Checkbox;
