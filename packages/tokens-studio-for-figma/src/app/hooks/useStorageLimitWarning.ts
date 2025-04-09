import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Dispatch } from '@/app/store';
import useConfirm from './useConfirm';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { Tabs } from '@/constants/Tabs';

export default function useStorageLimitWarning() {
  const { t } = useTranslation(['storage']);
  const dispatch = useDispatch<Dispatch>();
  const { confirm } = useConfirm();

  const showStorageLimitWarning = useCallback(async () => {
    const result = await confirm({
      text: t('storageLimitWarning.title'),
      description: t('storageLimitWarning.description'),
      confirmAction: t('storageLimitWarning.switchToRemote'),
      cancelAction: t('storageLimitWarning.useClientStorage'),
    });

    if (result && result.result) {
      // User chose to switch to remote storage
      dispatch.uiState.setActiveTab(Tabs.SETTINGS); // Switch to the sync settings tab
      return true;
    }
    // User chose to use client storage
    // Set a flag to use client storage for this user
    AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.SET_USE_CLIENT_STORAGE_FOR_LOCAL,
      value: true,
    });
    return false;
  }, [confirm, dispatch, t]);

  return { showStorageLimitWarning };
}
