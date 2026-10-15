import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Stack, Text } from '@tokens-studio/ui';
import { useIsProUser } from '@/app/hooks/useIsProUser';
import { useUpgradeDialogStore } from '@/app/store/useUpgradeDialogStore';

type Props = {
  filePath?: string;
};

// A folder path means multi-file sync, which only Pro enables; without it the folder is silently synced as one file.
export default function MultiFileSyncHint({ filePath }: Props) {
  const { t } = useTranslation(['upgrade']);
  const isProUser = useIsProUser();
  const openUpgradeDialog = useUpgradeDialogStore((state) => state.openUpgradeDialog);

  const handleLearnMore = useCallback(() => {
    openUpgradeDialog('multiFileSync', 'storage-form');
  }, [openUpgradeDialog]);

  if (isProUser || !filePath || filePath.endsWith('.json')) return null;

  return (
    <Stack direction="row" align="center" justify="between" gap={3} data-testid="multi-file-sync-hint">
      <Text size="xsmall">{t('multiFileSyncHint')}</Text>
      <Button size="small" variant="secondary" onClick={handleLearnMore}>{t('learnMore')}</Button>
    </Stack>
  );
}
