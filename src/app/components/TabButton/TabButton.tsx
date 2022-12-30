import React from 'react';
import { Tabs } from '@/constants/Tabs';
import { styled } from '@/stitches.config';
import { track } from '@/utils/analytics';

type Props<T extends string> = {
  name: T
  label: string
  activeTab?: T
  disabled?: boolean
  onSwitch: (tab: T) => void
};

const StyledButton = styled('button', {
  padding: '$5 $4',
  fontSize: '$xsmall',
  fontWeight: '$bold',
  cursor: 'pointer',
  color: '$textSubtle',
  '&:not(:disabled):focus, &:not(:disabled):hover': {
    outline: 'none',
    boxShadow: 'none',
    color: '$text',
  },
  '&:disabled': {
    pointerEvents: 'none',
    color: '$textDisbled',
  },
  variants: {
    isActive: {
      true: { color: '$text' },
    },
  },
});

export function TabButton<T extends string = Tabs>({
  name, label, activeTab, disabled, onSwitch,
}: Props<T>) {
  const onClick = React.useCallback(() => {
    track('Switched tab', { from: activeTab, to: name });
    onSwitch(name);
  }, [activeTab, name, onSwitch]);

  return (
    <StyledButton
      data-cy={`navitem-${name}`}
      data-testid={`navitem-${name}`}
      type="button"
      isActive={activeTab === name}
      data-active={activeTab === name}
      name={name}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </StyledButton>
  );
}
