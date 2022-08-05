import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { changedTabs } from '../changedTabs';
import * as sendSelectionChangeModule from '../../sendSelectionChange';

describe('changedTabs', () => {
  it('should work', async () => {
    const sendSelectionChangeSpy = jest.spyOn(sendSelectionChangeModule, 'sendSelectionChange');

    sendSelectionChangeSpy.mockResolvedValueOnce(null);
    await changedTabs({
      type: AsyncMessageTypes.CHANGED_TABS,
      requiresSelectionValues: false,
    });

    expect(sendSelectionChangeSpy).toBeCalledTimes(1);
  });
});
