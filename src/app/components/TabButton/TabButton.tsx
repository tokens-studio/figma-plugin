import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tabs } from '@/constants/Tabs';
import { styled } from '@/stitches.config';
import { Dispatch } from '@/app/store';
import { activeTabSelector } from '@/selectors';
import { track } from '@/utils/analytics';

type Props = {
  name: Tabs
  label: string
};

const StyledButton = styled('button', {
  padding: '$5 $4',
  fontSize: '$xsmall',
  fontWeight: '$bold',
  cursor: 'pointer',
  color: '$textMuted',
  '&:focus, &:hover': {
    outline: 'none',
    boxShadow: 'none',
    color: '$text',
  },
  variants: {
    isActive: {
      true: {
        color: '$text',
      },
    },
  },
});

export function TabButton({ name, label }: Props) {
  const activeTab = useSelector(activeTabSelector);
  const dispatch = useDispatch<Dispatch>();

  const onClick = React.useCallback(() => {
    track('Switched tab', { from: activeTab, to: name });
    dispatch.uiState.setActiveTab(name);
  }, [activeTab, name, dispatch.uiState]);

  return (
    <StyledButton
      data-cy={`navitem-${name}`}
      type="button"
      isActive={activeTab === name}
      name="text"
      onClick={onClick}
    >
      {label}
    </StyledButton>
  );
}
