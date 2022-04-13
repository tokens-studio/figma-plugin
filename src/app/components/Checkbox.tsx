import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import React, { useMemo } from 'react';
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

type Props = {
  checked: boolean | 'indeterminate';
  id: string | null;
  defaultChecked?: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: CheckboxPrimitive.CheckedState) => void;
  renderIcon?: (checked: boolean | 'indeterminate') => React.ReactNode;
};

function Checkbox({
  checked,
  id = null,
  defaultChecked = false,
  disabled = false,
  onCheckedChange,
  renderIcon,
}: Props) {
  const icon = useMemo(() => {
    if (renderIcon) return renderIcon(checked);
    if (checked === 'indeterminate') return <IconIndeterminate />;
    if (checked === true) return <IconCheck />;
    return null;
  }, [checked, renderIcon]);

  return (
    <StyledCheckbox
      id={id ?? undefined}
      disabled={disabled}
      isChecked={checked}
      checked={checked}
      onCheckedChange={onCheckedChange}
      defaultChecked={defaultChecked}
    >
      <StyledIndicator>
        {icon}
      </StyledIndicator>
    </StyledCheckbox>
  );
}

export default Checkbox;
