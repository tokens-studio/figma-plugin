import React from 'react';
import { Tabs } from '@/constants/Tabs';
import { styled } from '@/stitches.config';
import { track } from '@/utils/analytics';

type Props<T extends string> = {
  name: T
  label: string
  activeTab?: T
  onSwitch: (tab: T) => void
};

const StyledButton = styled('button', {
  padding: '$5 $4',
  fontSize: '$xsmall',
  fontWeight: '$bold',
  cursor: 'pointer',
  color: '$textSubtle',
  '&:focus, &:hover': {
    outline: 'none',
    boxShadow: 'none',
    color: '$text',
  },
  variants: {
    isActive: {
      true: { color: '$text' },
    },
  },
});

export function TabButton<T extends string = Tabs>({
  name, label, activeTab, onSwitch,
}: Props<T>) {
  const onClick = React.useCallback(() => {
    track('Switched tab', { from: activeTab, to: name });
    onSwitch(name);
  }, [activeTab, name, onSwitch]);

  return (
    <StyledButton
      data-cy={`navitem-${name}`}
      type="button"
      isActive={activeTab === name}
      data-active={activeTab === name}
      name={name}
      onClick={onClick}
    >
      {label}
    </StyledButton>
  );
}
