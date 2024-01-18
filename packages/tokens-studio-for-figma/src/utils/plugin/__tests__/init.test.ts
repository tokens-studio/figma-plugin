import { mockShowUI } from '../../../../tests/__mocks__/figmaMock';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { init } from '../init';
import * as notifiers from '@/plugin/notifiers';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

const notifyNoSelectionSpy = jest.spyOn(notifiers, 'notifyNoSelection');

describe('init', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should work', async () => {
    const runAfter = [
      AsyncMessageChannel.PluginInstance.connect(),
      AsyncMessageChannel.ReactInstance.connect(),
    ];

    const mockStartupHandler = jest.fn();
    AsyncMessageChannel.ReactInstance.handle(AsyncMessageTypes.STARTUP, mockStartupHandler);

    await init();
    expect(mockShowUI).toBeCalledTimes(1);
    expect(mockStartupHandler).toBeCalledTimes(1);
    expect(notifyNoSelectionSpy).toBeCalledTimes(1);

    runAfter.forEach((fn) => fn());
  });
});
