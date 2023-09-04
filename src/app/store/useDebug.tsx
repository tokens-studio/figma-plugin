import { AsyncMessageTypes } from '@/types/AsyncMessages';
import useConfirm from '../hooks/useConfirm';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { wrapTransaction } from '@/profiling/transaction';
import { UpdateMode } from '@/constants/UpdateMode';

export function useDebug() {
  const { confirm } = useConfirm();
  async function removeRelaunchData() {
    const userDecision = await confirm({
      text: 'Remove relaunch data?',
      description: 'This will remove the deprecated data in the properties panel on the right. This will not affect your tokens, styles or themes.',
      confirmAction: 'Confirm',
      choices: [
        {
          key: UpdateMode.SELECTION, label: 'Selection', unique: true, enabled: true,
        },
        {
          key: UpdateMode.PAGE, label: 'Page', unique: true, enabled: false,
        },
        {
          key: UpdateMode.DOCUMENT, label: 'Document', unique: true, enabled: false,
        },
      ],
    });

    if (userDecision && Array.isArray(userDecision.data) && userDecision.data.length) {
      wrapTransaction({ name: 'removeRelaunchData' }, async () => AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.REMOVE_RELAUNCH_DATA,
        area: userDecision.data[0],
      }));
    }
  }
  return { removeRelaunchData };
}
