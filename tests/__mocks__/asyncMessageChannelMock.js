import { AsyncMessageChannel } from '@/AsyncMessageChannel';

const mockAsyncMessageChannel = jest.spyOn(AsyncMessageChannel, 'message');
mockAsyncMessageChannel.mockImplementation(() => (
  Promise.resolve()
));