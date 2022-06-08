import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

module.exports.mockAsyncMessageChannelMessage = jest.spyOn(AsyncMessageChannel, 'message');
module.exports.mockAsyncMessageChannelMessage.mockImplementation((message) => {
  if (message.type === AsyncMessageTypes.GET_THEME_INFO) {
    return Promise.resolve({
      type: AsyncMessageTypes.GET_THEME_INFO,
      activeTheme: null,
      themes: [],
    })
  }

  return Promise.resolve();
});