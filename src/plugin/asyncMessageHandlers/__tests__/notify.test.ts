import { mockNotify } from '../../../../tests/__mocks__/figmaMock';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { notify } from '../notify';

describe('notify', () => {
  it('should work', async () => {
    await notify({
      type: AsyncMessageTypes.NOTIFY,
      msg: 'Hello world',
      opts: {},
    });

    expect(mockNotify).toBeCalledTimes(1);
  });
});
