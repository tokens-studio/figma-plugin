import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import DeprecationDialog from '../DeprecationDialog';
import { Tabs } from '@/constants/Tabs';
import { Dispatch } from '../../store';

export default function SecondScreen() {
  const dispatch = useDispatch<Dispatch>();
  const handleClose = useCallback(() => {
    dispatch.uiState.setActiveTab(Tabs.TOKENS);
  }, [dispatch]);
  return (
    <DeprecationDialog
      isOpen
      close={handleClose}
    />
  );
}
