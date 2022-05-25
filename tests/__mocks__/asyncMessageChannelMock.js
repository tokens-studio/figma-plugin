import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

const mockAsyncMessageChannel = jest.spyOn(AsyncMessageChannel, 'message');
mockAsyncMessageChannel.mockImplementation((message) => {
  if (message.type === AsyncMessageTypes.GET_THEME_INFO) {
    return Promise.resolve({
      type: AsyncMessageTypes.GET_THEME_INFO,
      activeTheme: null,
      themes: [],
    })
  }

  return Promise.resolve();
});