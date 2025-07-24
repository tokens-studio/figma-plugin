import React from 'react';
import { Tabs } from '@/constants/Tabs';
import { styled } from '@/stitches.config';
import { track } from '@/utils/analytics';
import Box from '../Box';
import Tooltip from '../Tooltip';

type Props<T extends string> = {
  name: T
  label?: string
  activeTab?: T
  disabled?: boolean
  onSwitch: (tab: T) => void
  startEnhancer?: React.ReactNode
  endEnhancer?: React.ReactNode,
  tooltip?: string;
  tooltipSide?: 'bottom' | 'left' | 'top' | undefined;
  small?: boolean;
};

const StyledButton = styled('button', {
  padding: '$5 $4',
  maxWidth: 'fit-content',
  fontSize: '$xsmall',
  fontWeight: '$sansBold',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '$2',
  cursor: 'pointer',
  color: '$fgMuted',
  opacity: 0.7,
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  '&:not(:disabled):focus, &:not(:disabled):hover': {
    outline: 'none',
    boxShadow: 'none',
    color: '$fgDefault',
  },
  '> svg': {
    minHeight: '100%',
  },
  '&:disabled': {
    pointerEvents: 'none',
    color: '$fgDisabled',
  },
  variants: {
    isActive: {
      true: { color: '$fgDefault', opacity: 1 },
    },
    small: {
      true: {
        padding: '0',
      },
    },
  },
});

export function TabButton<T extends string = Tabs>({
  name, label, activeTab, disabled, onSwitch, startEnhancer, endEnhancer, tooltip, tooltipSide, small,
}: Props<T>) {
  const onClick = React.useCallback(() => {
    track('Switched tab', { from: activeTab, to: name });
    onSwitch(name);
  }, [activeTab, name, onSwitch]);

  return (
    <StyledButton
      data-testid={`navitem-${name}`}
      type="button"
      isActive={activeTab === name}
      data-active={activeTab === name}
      name={name}
      disabled={disabled}
      onClick={onClick}
      small={small}
    >
      <Tooltip side={tooltipSide} label={tooltip ?? ''}>
        <>
          {startEnhancer && startEnhancer}
          {label && (
          <Box css={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          >
            {label}
          </Box>
          )}
          {endEnhancer && endEnhancer}
        </>
      </Tooltip>
    </StyledButton>
  );
}
