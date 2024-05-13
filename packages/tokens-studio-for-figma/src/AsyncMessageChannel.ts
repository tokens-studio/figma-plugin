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

const sendWsMessage = <Message>(ws, msg: Message) => {
  const message = JSON.stringify(msg);
  if (ws && ws.readyState === 1) {
    ws.send(message);
  } else {
    setTimeout(() => {
      sendWsMessage(ws, msg);
    }, 1000);
  }
};

const sendMessageToController = (pluginMessage) => {
  parent.postMessage(
    { pluginMessage },
    '*',
  );
};

const parseWsEvent = (event) => {
  try {
    const msg = JSON.parse(event.data);
    if (msg.src === 'server') {
      const temp = JSON.parse(msg.message);
      return temp;
    }
  } catch (err) {
    console.error('not a valid message', err);
    return null;
  }
  return null;
};

enum Environment {
  PLUGIN = 'PLUGIN',
  UI = 'UI',
  BROWSER = 'BROWSER',
}

export class AsyncMessageChannel {
  public static PluginInstance: AsyncMessageChannel = new AsyncMessageChannel(true);

  public static ReactInstance: AsyncMessageChannel = new AsyncMessageChannel(false);

  protected $handlers: Partial<AsyncMessageChannelHandlers> = {};

  protected isInFigmaSandbox = false;

  protected environment: Environment | null = null;

  protected ws: WebSocket | null = null;

  public isWsConnected: boolean = false;

  constructor(inFigmaSandbox: boolean) {
    this.isInFigmaSandbox = inFigmaSandbox;
    if (inFigmaSandbox) {
      this.environment = Environment.PLUGIN;
    } else if (process.env.PREVIEW_ENV === 'browser') {
      this.environment = Environment.BROWSER;
    } else {
      this.environment = Environment.UI;
    }
  }

  private sendMessageToBrowser = (msg) => {
    sendWsMessage(this.ws, { ...msg, src: 'ui' });
  };

  private sendMessageFromBrowser = (msg) => {
    sendWsMessage(this.ws, { ...msg, src: 'browser' });
  };

  public getWs() {
    return this.ws;
  }

  private addWsEventListener(callback) {
    const listener = async (event) => {
      const msg = parseWsEvent(event);
      const possiblePromise = callback(msg);
      if (possiblePromise === false || (possiblePromise && await possiblePromise === false)) {
        this.ws?.removeEventListener('message', listener);
      }
    };
    this.ws?.addEventListener('message', listener);
    return listener;
  }

  public attachMessageListener<Message>(callback: (msg: Message) => void | false | Promise<void | false>) {
    switch (this.environment) {
      case Environment.PLUGIN: {
        const listener = async (msg: Message) => {
          const possiblePromise = callback(msg);
          if (possiblePromise === false || (possiblePromise && await possiblePromise === false)) {
            figma.ui.off('message', listener);
          }
        };
        figma.ui.on('message', listener);
        return () => figma.ui.off('message', listener);
      }
      case Environment.BROWSER: {
        const listener = this.addWsEventListener(callback);
        return () => this.ws?.removeEventListener('message', listener);
      }
      case Environment.UI: {
        let wsListener;
        if (process.env.PREVIEW_ENV === 'figma') {
          wsListener = this.addWsEventListener(callback);
        }
        const listener = async (event: { data: { pluginMessage: Message } }) => {
          const possiblePromise = callback(event.data.pluginMessage);
          if (possiblePromise === false || (possiblePromise && await possiblePromise === false)) {
            window.removeEventListener('message', listener);
          }
        };
        window.addEventListener('message', listener);
        return () => {
          window.removeEventListener('message', listener);
          this.ws?.removeEventListener('message', wsListener);
        };
      }
      default: {
        return null;
      }
    }
  }

  public attachWsEventListener<Message>(callback: (msg: Message) => void | false | Promise<void | false>) {
    if (!this.ws) {
      return () => {};
    }
    const listener = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.src === 'server') {
          const temp = JSON.parse(msg.message);
          callback(temp);
        }
      } catch (err) {
        console.error('not a valid message', err);
      }
    };

    this.ws.addEventListener('message', listener);

    return () => { if (this.ws) { this.ws.removeEventListener('message', listener); } };
  }

  private startWebSocket() {
    this.ws = new WebSocket('ws://localhost:9001/ws');
    const self = this;
    this.ws.addEventListener('open', () => {
      self.isWsConnected = true;
    });
    this.ws.addEventListener('close', () => {
      self.isWsConnected = false;
      setTimeout(() => {
        this.ws = null;
        this.startWebSocket();
      }, 5000);
    });

    return () => {
      if (this.ws) {
        this.ws.close();
      }
    };
  }

  private onMessageEvent = async (msg: { id?: string; message?: AsyncMessages, src?: 'browser' | 'ui' | 'controller' }) => {
    // This appears to be related to the monaco editor being opened. It appears to post a message to the window message event listener with no data.
    if (!msg || !msg.id || !msg.message || !msg.message.type.startsWith('async/')) {
      // eslint-disable-next-line no-console
      // console.warn('Invalid message received', msg);
      if ((msg as any)?.type && this.environment === Environment.UI) {
        if (msg.src !== 'browser') {
          this.sendMessageToBrowser({ ...msg, src: 'ui' });
        } else {
          parent.postMessage({
            pluginMessage: msg,
          }, '*');
        }
        return;
      }
      return;
    }
    const handler = this.$handlers[msg.message.type] as AsyncMessageChannelHandlers[AsyncMessageTypes] | undefined;
    if (this.environment === Environment.UI) {
      if (msg.src !== 'browser') {
        this.sendMessageToBrowser({ ...msg, src: 'ui' });
      } else {
        parent.postMessage({
          pluginMessage: msg,
        }, '*');
      }
      return;
    }
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
        } else { // eslint-disable-next-line
          if (this.environment === Environment.BROWSER) {
            this.sendMessageFromBrowser({ ...msg, src: 'browser' });
          } else {
            parent.postMessage({
              pluginMessage: { id: msg.id, message: payload },
            }, '*');
          }
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
  };

  public connect() {
    if (this.environment !== Environment.PLUGIN && process.env.PREVIEW_ENV) {
      this.startWebSocket();
    }
    // if (process.env.PREVIEW_ENV === 'browser') {
    //   return null;
    // }

    return this.attachMessageListener(this.onMessageEvent);
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
    switch (this.environment) {
      case Environment.PLUGIN: {
        figma.ui.postMessage({ id: messageId, message, src: 'figma' });
        break;
      }
      case Environment.UI: {
        if (process.env.PREVIEW_ENV === 'figma') {
          this.sendMessageToBrowser({ id: messageId, message });
        } else {
          sendMessageToController({ id: messageId, message });
        }
        break;
      }
      case Environment.BROWSER: {
        this.sendMessageFromBrowser({ id: messageId, message });
        break;
      }
      default: {
        break;
      }
    }
    return promise;
  }
}
