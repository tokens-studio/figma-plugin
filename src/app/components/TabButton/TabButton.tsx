import React from 'react';
import { Tabs } from '@/constants/Tabs';
import { styled } from '@/stitches.config';
import { track } from '@/utils/analytics';
import Box from '../Box';

type Props<T extends string> = {
  name: T
  label: string
  activeTab?: T
  disabled?: boolean
  onSwitch: (tab: T) => void
  startEnhancer?: React.ReactNode
  endEnhancer?: React.ReactNode
};

const StyledButton = styled('button', {
  '@initial': {
    padding: '$5 $4',
    maxWidth: 'fit-content',
  },
  '@xs': {
    padding: '$5 $3',
    maxWidth: '64px',
  },
  '@sm': {
    padding: '$5 $4',
    maxWidth: '96px',
  },
  '@md': {
    padding: '$5 $4',
    maxWidth: 'fit-content',
  },
  fontSize: '$xsmall',
  fontWeight: '$bold',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '$2',
  cursor: 'pointer',
  color: '$textSubtle',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  '&:not(:disabled):focus, &:not(:disabled):hover': {
    outline: 'none',
    boxShadow: 'none',
    color: '$text',
  },
  '@container (width < 64px)': {
    '> svg': {
      display: 'none',
    },
  },
  '> svg': {
    minHeight: '100%',
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
  name, label, activeTab, disabled, onSwitch, startEnhancer, endEnhancer,
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
      {startEnhancer && startEnhancer}
      <Box css={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
      >
        {label}
      </Box>
      {endEnhancer && endEnhancer}
    </StyledButton>
  );
}
