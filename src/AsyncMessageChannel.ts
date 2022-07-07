import hash from 'object-hash';
import {
  AsyncMessageResults, AsyncMessageResultsMap, AsyncMessages, AsyncMessagesMap, AsyncMessageTypes,
} from './types/AsyncMessages';

// credits goes to https://github.com/microsoft/TypeScript/issues/23182#issuecomment-379091887
type IsTypeOnlyObject<Obj extends Record<PropertyKey, unknown>> = [keyof Obj] extends ['type'] ? true : false;

type IncomingMessageEvent<Message = unknown> = {
  data: {
    pluginMessage: {
      id: string
      message: Message
    } | {
      id: string
      error: unknown
    }
  }
};

export type AsyncMessageChannelHandlers = {
  [K in AsyncMessageTypes]: (incoming: AsyncMessagesMap[K]) => Promise<
  IsTypeOnlyObject<AsyncMessageResultsMap[K]> extends true
    ? void
    : Omit<AsyncMessageResultsMap[K], 'type'>
  >
};

export class AsyncMessageChannel {
  public static PluginInstance: AsyncMessageChannel = new AsyncMessageChannel(true);

  public static ReactInstance: AsyncMessageChannel = new AsyncMessageChannel(false);

  protected $handlers: Partial<AsyncMessageChannelHandlers> = {};

  protected isInFigmaSandbox = false;

  constructor(inFigmaSandbox: boolean) {
    this.isInFigmaSandbox = inFigmaSandbox;
  }

  public attachMessageListener<Message>(callback: (msg: Message) => void | false | Promise<void | false>) {
    if (this.isInFigmaSandbox) {
      const listener = async (msg: Message) => {
        const possiblePromise = callback(msg);
        if (possiblePromise === false || (possiblePromise && await possiblePromise === false)) {
          figma.ui.off('message', listener);
        }
      };
      figma.ui.on('message', listener);
      return () => figma.ui.off('message', listener);
    }

    const listener = async (event: { data: { pluginMessage: Message } }) => {
      const possiblePromise = callback(event.data.pluginMessage);
      if (possiblePromise === false || (possiblePromise && await possiblePromise === false)) {
        window.removeEventListener('message', listener);
      }
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }

  public connect() {
    return this.attachMessageListener(async (msg: { id?: string; message?: AsyncMessages }) => {
      if (!msg.id || !msg.message || !msg.message.type.startsWith('async/')) return;
      const handler = this.$handlers[msg.message.type] as AsyncMessageChannelHandlers[AsyncMessageTypes] | undefined;
      if (handler) {
        try {
          // @README need to cast to any to make this work
          // it causes a complex type which can not be resolved due to its depth
          const result = await (handler as any)(msg.message);
          const payload = result
            ? { ...result, type: msg.message.type }
            : { type: msg.message.type };

          if (this.isInFigmaSandbox) {
            figma.ui.postMessage({
              id: msg.id,
              message: payload,
            });
          } else {
            parent.postMessage({
              pluginMessage: { id: msg.id, message: payload },
            }, '*');
          }
        } catch (err) {
          console.error(err);
          if (this.isInFigmaSandbox) {
            figma.ui.postMessage({
              id: msg.id,
              error: err,
            });
          } else {
            parent.postMessage({
              pluginMessage: { id: msg.id, error: err },
            }, '*');
          }
        }
      }
    });
  }

  public handle<T extends AsyncMessageTypes>(
    type: T,
    fn: AsyncMessageChannelHandlers[T],
  ) {
    this.$handlers[type] = fn;
  }

  public async message<Message extends AsyncMessages>(message: Message) {
    const messageId = hash({
      message,
      datetime: Date.now(),
    });
    const promise = new Promise<AsyncMessageResults & { type: Message['type'] }>((resolve, reject) => {
      this.attachMessageListener((msg: IncomingMessageEvent<AsyncMessageResults & { type: Message['type'] }>['data']['pluginMessage']) => {
        if (msg.id === messageId) {
          if ('message' in msg) {
            resolve(msg.message);
          } else {
            reject(msg.error);
          }
          return false;
        }
        return undefined;
      });
    });
    if (this.isInFigmaSandbox) {
      figma.ui.postMessage({ id: messageId, message });
    } else {
      parent.postMessage(
        { pluginMessage: { id: messageId, message } },
        '*',
      );
    }
    return promise;
  }
}
