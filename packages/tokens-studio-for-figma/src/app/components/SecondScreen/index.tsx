import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import SecondScreenDeprecationDialog from '../SecondScreenDeprecationDialog';
import { Tabs } from '@/constants/Tabs';
import { Dispatch } from '../../store';

export default function SecondScreen() {
  const dispatch = useDispatch<Dispatch>();
  const handleClose = useCallback(() => {
    dispatch.uiState.setActiveTab(Tabs.TOKENS);
  }, [dispatch]);
  return (
    <SecondScreenDeprecationDialog
      isOpen
      close={handleClose}
    />
  );
}
