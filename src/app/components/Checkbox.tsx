import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import React, { useMemo } from 'react';
import { styled } from '@/stitches.config';
import IconCheck from '@/icons/check.svg';
import IconIndeterminate from '@/icons/indeterminate.svg';

const StyledIndicator = styled(CheckboxPrimitive.Indicator, {
  color: '$fgOnEmphasis',
});

const StyledCheckbox = styled(CheckboxPrimitive.Root, {
  all: 'unset',
  backgroundColor: '$bgDefault',
  flexShrink: 0,
  borderRadius: '$small',
  border: '1px solid $accentDefault',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 12,
  height: 12,
  '&:focus': { boxShadow: '$focus' },
  variants: {
    isChecked: {
      true: {
        backgroundColor: '$accentDefault',
        borderColor: '$accentDefault',
      },
      indeterminate: {
        backgroundColor: '$accentMuted',
        borderColor: '$accentMuted',
      },
    },
  },
});

type CheckboxProps = {
  checked: boolean | 'indeterminate';
  id: string | null;
  defaultChecked?: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: CheckboxPrimitive.CheckedState) => void;
  renderIcon?: (checked: boolean | 'indeterminate', fallback: React.ReactNode) => React.ReactNode;
};

type Props = Omit<React.HTMLAttributes<HTMLButtonElement>, keyof CheckboxProps> & CheckboxProps;

function Checkbox({
  checked,
  id = null,
  defaultChecked = false,
  disabled = false,
  onCheckedChange,
  renderIcon,
  ...props
}: Props) {
  const icon = useMemo(() => {
    let fallbackIcon: React.ReactNode = null;
    if (checked === 'indeterminate') {
      fallbackIcon = <IconIndeterminate />;
    } else if (checked === true) {
      fallbackIcon = <IconCheck />;
    }
    if (renderIcon) return renderIcon(checked, fallbackIcon);
    return fallbackIcon;
  }, [checked, renderIcon]);

  return (
    <StyledCheckbox
      id={id ?? undefined}
      data-testid={id ?? undefined}
      disabled={disabled}
      isChecked={!!checked}
      checked={checked}
      onCheckedChange={onCheckedChange}
      defaultChecked={defaultChecked}
      {...props}
    >
      <StyledIndicator>
        {icon}
      </StyledIndicator>
    </StyledCheckbox>
  );
}

export default Checkbox;
