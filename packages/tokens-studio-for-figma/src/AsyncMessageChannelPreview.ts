import hash from 'object-hash';
import {
  AsyncMessageResults,
  AsyncMessageResultsMap,
  AsyncMessages,
  AsyncMessagesMap,
  AsyncMessageTypes,
} from './types/AsyncMessages';

// credits goes to https://github.com/microsoft/TypeScript/issues/23182#issuecomment-379091887
type IsTypeOnlyObject<Obj extends Record<PropertyKey, unknown>> = [keyof Obj] extends ['type'] ? true : false;

type IncomingMessageEvent<Message = unknown> = {
  data: {
    pluginMessage:
    | {
      id: string;
      message: Message;
    }
    | {
      id: string;
      error: unknown;
    };
  };
};

export type AsyncMessageChannelHandlers = {
  [K in AsyncMessageTypes]: (
    incoming: AsyncMessagesMap[K],
  ) => Promise<IsTypeOnlyObject<AsyncMessageResultsMap[K]> extends true ? void : Omit<AsyncMessageResultsMap[K], 'type'>>;
};

export const WEBSOCKET_SERVER_URL = 'ws://localhost:9001/ws';

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
  parent.postMessage({ pluginMessage }, '*');
};

const sendMessageToUi = (pluginMessage) => {
  figma.ui.postMessage(pluginMessage);
};

const parseWsEvent = (event) => {
  try {
    const msg = JSON.parse(event.data);
    if (msg.src === 'server') {
      const temp = JSON.parse(msg.message);
      return temp;
    }
  } catch (err) {
    console.warn('not a valid message', err);
    return null;
  }
  return null;
};

enum Environment {
  PLUGIN = 'PLUGIN',
  UI = 'UI',
  BROWSER = 'BROWSER',
}

enum WebSocketsSource {
  browser = 'browser',
  ui = 'ui',
  figma = 'figma',
}

enum PreviewEnvVar {
  browser = 'browser',
  figma = 'figma',
}

export class AsyncMessageChannelPreview {
  public static PluginInstance: AsyncMessageChannelPreview = new AsyncMessageChannelPreview(true);

  public static ReactInstance: AsyncMessageChannelPreview = new AsyncMessageChannelPreview(false);

  protected $handlers: Partial<AsyncMessageChannelHandlers> = {};

  protected isInFigmaSandbox = false;

  protected environment: Environment | null = null;

  protected isPreview: boolean = false;

  protected ws: WebSocket | null = null;

  public isWsConnected: boolean = false;

  constructor(inFigmaSandbox: boolean) {
    this.isInFigmaSandbox = inFigmaSandbox;
    if (inFigmaSandbox) {
      this.environment = Environment.PLUGIN;
    } else if (process.env.PREVIEW_ENV === PreviewEnvVar.browser) {
      this.environment = Environment.BROWSER;
    } else {
      this.environment = Environment.UI;
    }

    if (process.env.PREVIEW_ENV) {
      this.isPreview = true;
    }
  }

  private sendMessageToBrowser = (msg) => {
    sendWsMessage(this.ws, { ...msg, src: WebSocketsSource.ui });
  };

  private sendMessageFromBrowser = (msg) => {
    sendWsMessage(this.ws, { ...msg, src: WebSocketsSource.browser });
  };

  public getWs() {
    return this.ws;
  }

  private listenerFactory<Message>(callback, removeEventListener, parseEvent = (event) => event) {
    const listener = async (msg: Message) => {
      const possiblePromise = callback(parseEvent(msg));
      if (possiblePromise === false || (possiblePromise && (await possiblePromise) === false)) {
        removeEventListener('message', listener);
      }
    };

    return listener;
  }

  public attachMessageListener<Message>(callback: (msg: Message) => void | false | Promise<void | false>) {
    switch (this.environment) {
      case Environment.PLUGIN: {
        const listener = this.listenerFactory(callback, figma.ui.off);
        figma.ui.on('message', listener);
        return () => figma.ui.off('message', listener);
      }
      case Environment.BROWSER:
      case Environment.UI: {
        const wsListener = this.isPreview
          ? this.listenerFactory(callback, this.ws?.removeEventListener, parseWsEvent)
          : null;
        const listener = this.listenerFactory(
          callback,
          window.removeEventListener,
          (event: { data: { pluginMessage: Message } }) => event.data.pluginMessage,
        );
        window.addEventListener('message', listener);
        if (wsListener) {
          this.ws?.addEventListener('message', wsListener);
        }
        return () => {
          window.removeEventListener('message', listener);
          if (wsListener) {
            this.ws?.removeEventListener('message', wsListener);
          }
        };
      }
      default: {
        return null;
      }
    }
  }

  private startWebSocketConnection() {
    if (this.ws === null) {
      this.ws = new WebSocket(WEBSOCKET_SERVER_URL);
      const self = this;
      this.ws.addEventListener('open', () => {
        self.isWsConnected = true;
      });
      this.ws.addEventListener('close', () => {
        self.isWsConnected = false;
        setTimeout(() => {
          self.ws = null;
          this.startWebSocketConnection();
        }, 5000);
      });
    }

    return () => {
      if (this.ws) {
        this.ws.close();
      }
    };
  }

  private onMessageEvent = async (msg: { id?: string; message?: AsyncMessages; src?: WebSocketsSource }) => {
    // This appears to be related to the monaco editor being opened. It appears to post a message to the window message event listener with no data.
    if (!msg || !msg.id || !msg.message || !msg.message.type.startsWith('async/')) {
      // eslint-disable-next-line no-console
      if ((msg as any)?.type && this.environment === Environment.UI) {
        if (msg.src !== WebSocketsSource.browser) {
          this.sendMessageToBrowser({ ...msg, src: WebSocketsSource.ui });
        } else {
          sendMessageToController(msg);
        }
        return;
      }
      return;
    }
    const handler = this.$handlers[msg.message.type] as AsyncMessageChannelHandlers[AsyncMessageTypes] | undefined;
    if (this.environment === Environment.UI && this.isPreview) {
      if (msg.src !== WebSocketsSource.browser) {
        this.sendMessageToBrowser({ ...msg, src: WebSocketsSource.ui });
      } else {
        sendMessageToController(msg);
      }
      return;
    }
    if (handler) {
      try {
        // @README need to cast to any to make this work
        // it causes a complex type which can not be resolved due to its depth
        const result = await (handler as any)(msg.message);
        const payload = result ? { ...result, type: msg.message.type } : { type: msg.message.type };

        if (this.isInFigmaSandbox) {
          sendMessageToUi({
            id: msg.id,
            message: payload,
          });
        } else if (this.environment === Environment.BROWSER) {
          this.sendMessageFromBrowser({ id: msg.id, message: payload, src: WebSocketsSource.browser });
        } else {
          sendMessageToController({ id: msg.id, message: payload });
        }
      } catch (err) {
        console.error(err);
        if (this.isInFigmaSandbox) {
          sendMessageToUi({
            id: msg.id,
            error: err,
          });
        } else {
          sendMessageToController({ id: msg.id, error: err });
        }
      }
    }
  };

  public connect() {
    if (this.environment !== Environment.PLUGIN && this.isPreview) {
      this.startWebSocketConnection();
    }

    return this.attachMessageListener(this.onMessageEvent);
  }

  public handle<T extends AsyncMessageTypes>(type: T, fn: AsyncMessageChannelHandlers[T]) {
    this.$handlers[type] = fn;
  }

  public async message<Message extends AsyncMessages>(message: Message) {
    const messageId = hash({
      message,
      datetime: Date.now(),
    });
    const promise = new Promise<AsyncMessageResults & { type: Message['type'] }>((resolve, reject) => {
      this.attachMessageListener(
        (msg: IncomingMessageEvent<AsyncMessageResults & { type: Message['type'] }>['data']['pluginMessage']) => {
          if (msg?.id === messageId) {
            if ('message' in msg) {
              resolve(msg.message);
            } else {
              reject(msg.error);
            }
            return false;
          }
          return undefined;
        },
      );
    });
    switch (this.environment) {
      case Environment.PLUGIN: {
        sendMessageToUi({ id: messageId, message, src: WebSocketsSource.figma });
        break;
      }
      case Environment.UI: {
        if (this.isPreview) {
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
