import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import fbpClient from 'fbp-client';
import { AnyTokenList, SingleToken } from '@/types/tokens';
import { RemoteResponseData } from '@/types/RemoteResponseData';
import { StorageProviderType, StorageTypeCredentials, StorageTypeFormValues } from '@/types/StorageType';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { WebSocketTokenStorage } from '@/storage/WebSocketTokenStorage';

type WebSocketCredentials = Extract<StorageTypeCredentials, { provider: StorageProviderType.WEB_SOCKET }>;
type WebSocketFormValues = Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.WEB_SOCKET }>;


export function useWebSocket() {
  const [tokens, setTokens] = useState<Record<string, AnyTokenList>>({});
  const clientRef = useRef<WebSocket | null>(null);

  const storageClientFactory = useCallback((context: WebSocketCredentials) => {
    const storageClient = new WebSocketTokenStorage(context.id, context.secret);
    return storageClient;
  }, []);

  const connect = useCallback(async (context: WebSocketCredentials) => {
    const storage = storageClientFactory(context);

    await storage.connect();

    const client = storage.client;
    clientRef.current = client;

    client.on('message', (message) => {
        console.log('message:', message);
    });

    client.on('signal', (signal) => {
        console.log('Signal:', signal);
    });

    client.on('runtime:packet', (packet) => {
      console.log('Runtime packet:', packet);
    });
}, []);


  const closeConnection = () => {
    if (clientRef.current) {
      clientRef.current.close();
    }
  };

  const addNewWebSocketCredentials = useCallback(
    async (context: WebSocketFormValues): Promise<RemoteResponseData> => {

    connect(context);

    AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.CREDENTIALS,
        credential: context,
    });

    return {
        status: 'success',
        tokens,
        themes: [],
    };
    }, [connect, tokens],
  );


  return {
    connect, closeConnection, tokens, addNewWebSocketCredentials
  };
}
