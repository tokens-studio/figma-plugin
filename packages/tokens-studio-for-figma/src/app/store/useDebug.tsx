import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import useConfirm from '../hooks/useConfirm';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { wrapTransaction } from '@/profiling/transaction';
import { UpdateMode } from '@/constants/UpdateMode';

export function useDebug() {
  const { confirm } = useConfirm();
  const { t } = useTranslation(['settings']);

  const removeRelaunchData = useCallback(async () => {
    const userDecision = await confirm({
      text: t('removeRelaunchData.title'),
      description: t('removeRelaunchData.description'),
      confirmAction: t('removeRelaunchData.confirm'),
      choices: [
        {
          key: UpdateMode.SELECTION, label: t('removeRelaunchData.selection'), unique: true, enabled: true,
        },
        {
          key: UpdateMode.PAGE, label: t('removeRelaunchData.page'), unique: true, enabled: false,
        },
        {
          key: UpdateMode.DOCUMENT, label: t('removeRelaunchData.document'), unique: true, enabled: false,
        },
      ],
    });

    if (userDecision && Array.isArray(userDecision.data) && userDecision.data.length) {
      wrapTransaction({ name: 'removeRelaunchData' }, async () => AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.REMOVE_RELAUNCH_DATA,
        area: userDecision.data[0],
      }));
    }
  }, [t, confirm]);
  return { removeRelaunchData };
}
