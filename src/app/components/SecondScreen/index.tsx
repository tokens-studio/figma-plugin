import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LightningBoltIcon } from '@radix-ui/react-icons';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import Box from '../Box';
import { secondScreenSelector } from '@/selectors/secondScreenSelector';
import { Dispatch } from '@/app/store';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from '../DropdownMenu';

export default function SecondScreen() {
  const isEnabled = useSelector(secondScreenSelector);
  const dispatch = useDispatch<Dispatch>();
  const { user, handleLogout } = useAuth();

  const onSyncClick = useCallback(() => {
    dispatch.uiState.toggleSecondScreen();
  }, [dispatch.uiState]);

  const handleOpenSecondScreen = useCallback(() => {
    window.open(process.env.SECOND_SCREEN_APP_URL);
  }, []);

  const handleTurnOffSync = useCallback(() => {
    dispatch.uiState.toggleSecondScreen();
  }, [dispatch.uiState]);

  const secondScreenButton = (
    <Box
      css={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '$3',
        padding: '$2 $4',
        background: isEnabled ? 'rgba(65, 63, 63, 1)' : 'transparent',
        borderRadius: '6px',
        cursor: 'pointer',
        marginLeft: '$4',
      }}
      onClick={onSyncClick}
    >
      <LightningBoltIcon />
      Live-Sync
      <Box
        css={{
          height: '7px',
          width: '7px',
          borderRadius: '50%',
          background: isEnabled && user ? '$fgSuccess' : '$fgDanger',
        }}
      />
    </Box>
  );

  if (user && isEnabled) {
    return (
      <DropdownMenu>
        <DropdownMenuPrimitive.Trigger>{secondScreenButton}</DropdownMenuPrimitive.Trigger>
        <DropdownMenuContent>
          <Box css={{ padding: '$3', color: '$textMuted' }}>{`Logged in as ${user.email}`}</Box>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleTurnOffSync}>Turn off sync</DropdownMenuItem>
          <DropdownMenuItem onSelect={handleOpenSecondScreen}>Open second screen</DropdownMenuItem>
          <DropdownMenuItem onSelect={handleLogout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return secondScreenButton;
}