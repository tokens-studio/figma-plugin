import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import useConfirm from '@/app/hooks/useConfirm';

export function useStorageSizeWarning(tokensSize: number) {
  const { confirm } = useConfirm();
  const { t } = useTranslation(['tokens']);
  return useCallback(() => {
    if (tokensSize >= 90) {
      confirm({
        text: t('storageLimitWarning.title'),
        description: t('storageLimitWarning.description'),
        confirmAction: t('storageLimitWarning.switchToRemote'),
      });
    }
  }, [confirm, tokensSize, t]);
}
