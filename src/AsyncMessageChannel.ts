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

const isInFigmaSandbox = typeof figma !== 'undefined';

export class AsyncMessageChannel {
  protected static $handlers: Partial<AsyncMessageChannelHandlers> = {};

  public static attachMessageListener<Message>(callback: (msg: Message) => void | false | Promise<void | false>) {
    if (isInFigmaSandbox) {
      const listener = async (msg: Message) => {
        const possiblePromise = callback(msg);
        if (possiblePromise === false || (possiblePromise && await possiblePromise === false)) {
          figma.ui.off('message', listener);
        }
      };
      figma.ui.on('message', listener);
      return listener;
    }

    const listener = async (event: { data: { pluginMessage: Message } }) => {
      const possiblePromise = callback(event.data.pluginMessage);
      if (possiblePromise === false || (possiblePromise && await possiblePromise === false)) {
        window.removeEventListener('message', listener);
      }
    };
    window.addEventListener('message', listener);
    return listener;
  }

  public static connect() {
    AsyncMessageChannel.attachMessageListener(async (msg: { id?: string; message?: AsyncMessages }) => {
      if (!msg.id || !msg.message || !msg.message.type.startsWith('async/')) return;
      const handler = AsyncMessageChannel.$handlers[msg.message.type] as AsyncMessageChannelHandlers[AsyncMessageTypes] | undefined;
      if (handler) {
        try {
          // @README need to cast to any to make this work
          // it causes a complex type which can not be resolved due to its depth
          const result = await (handler as any)(msg.message);
          const payload = result
            ? { ...result, type: msg.message.type }
            : { type: msg.message.type };

          if (isInFigmaSandbox) {
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
          if (isInFigmaSandbox) {
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

  public static handle<T extends AsyncMessageTypes>(
    type: T,
    fn: typeof AsyncMessageChannel['$handlers'][T],
  ) {
    this.$handlers[type] = fn;
  }

  public static async message<Message extends AsyncMessages>(message: Message) {
    const messageId = hash({
      message,
      datetime: Date.now(),
    });
    const promise = new Promise<AsyncMessageResults & { type: Message['type'] }>((resolve, reject) => {
      AsyncMessageChannel.attachMessageListener((msg: IncomingMessageEvent<AsyncMessageResults & { type: Message['type'] }>['data']['pluginMessage']) => {
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
    if (isInFigmaSandbox) {
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
