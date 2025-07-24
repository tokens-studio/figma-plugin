import { MessageFromPluginTypes, PostToUIMessage } from '@/types/messages';

export function waitForMessage<M extends MessageFromPluginTypes>(message: M): Promise<PostToUIMessage & { type: M }> {
  return new Promise<PostToUIMessage & { type: M }>((res) => {
    type Event = {
      data: {
        pluginMessage: PostToUIMessage
      }
    };

    const handler = (event: Event) => {
      if (event.data.pluginMessage.type === message) {
        window.removeEventListener('message', handler);
        res(event.data.pluginMessage as PostToUIMessage & { type: M });
      }
    };

    window.addEventListener('message', handler);
  });
}
