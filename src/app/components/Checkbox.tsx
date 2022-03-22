import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import React from 'react';
import { styled } from '@/stitches.config';
import IconCheck from '@/icons/check.svg';
import IconIndeterminate from '@/icons/indeterminate.svg';

const StyledIndicator = styled(CheckboxPrimitive.Indicator, {
  color: '$onInteraction',
});

const StyledCheckbox = styled(CheckboxPrimitive.Root, {
  all: 'unset',
  backgroundColor: '$bgDefault',
  borderRadius: '$input',
  border: '1px solid $interaction',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 12,
  height: 12,
  '&:focus': { boxShadow: '0 0 0 2px black' },

  variants: {
    isChecked: {
      true: {
        backgroundColor: '$interaction',
        borderColor: '$interaction',
      },
      indeterminate: {
        backgroundColor: '$interactionSubtle',
        borderColor: '$interactionSubtle',
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
  checked: boolean | 'indeterminate';
  id: string;
  onCheckedChange: any;
  defaultChecked?: boolean;
  disabled?: boolean;
}) {
  return (
    <StyledCheckbox
      id={id}
      disabled={disabled}
      isChecked={checked}
      checked={checked}
      onCheckedChange={onCheckedChange}
      defaultChecked={defaultChecked}
    >
      <StyledIndicator>
        {checked === 'indeterminate' && <IconIndeterminate />}
        {checked === true && <IconCheck />}
      </StyledIndicator>
    </StyledCheckbox>
  );
}

export default Checkbox;
