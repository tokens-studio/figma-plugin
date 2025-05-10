import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation, Trans } from 'react-i18next';
import useConfirm from '@/app/hooks/useConfirm';
import { Dispatch } from '@/app/store';
import { Tabs } from '@/constants/Tabs';

export function useStorageSizeWarning() {
  const { confirm } = useConfirm();
  const { t } = useTranslation(['tokens']);
  const dispatch = useDispatch<Dispatch>();

  return useCallback(async () => {
    const description = (
      <Trans
        i18nKey="storageLimitWarning.description"
        ns="tokens"
        components={{
          br: <br />,
        }}
      />
    );

    const confirmed = await confirm({
      text: t('storageLimitWarning.title'),
      description,
      confirmAction: t('storageLimitWarning.switchToRemote'),
    });
    if (confirmed) {
      dispatch.uiState.setActiveTab(Tabs.SETTINGS);
    }
  }, [confirm, t, dispatch]);
}
