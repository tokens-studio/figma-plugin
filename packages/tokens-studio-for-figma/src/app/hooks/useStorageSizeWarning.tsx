import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import useConfirm from '@/app/hooks/useConfirm';
import { Dispatch } from '@/app/store';
import { Tabs } from '@/constants/Tabs';

export function useStorageSizeWarning(tokensSize: number) { // TODO: customise message displayed based on the tokensSize received
  const { confirm } = useConfirm();
  const { t } = useTranslation(['tokens']);
  const dispatch = useDispatch<Dispatch>();
  return useCallback(async () => {
    const confirmed = await confirm({
      text: t('storageLimitWarning.title'),
      description: t('storageLimitWarning.description'),
      confirmAction: t('storageLimitWarning.switchToRemote'),
    });
    if (confirmed) {
      dispatch.uiState.setActiveTab(Tabs.SETTINGS);
    }
  }, [confirm, t, dispatch]);
}
