import fbpClient from 'fbp-client';
import { SaveOption } from './FileTokenStorage';
import { RemoteTokenStorage, RemoteTokenStorageFile, RemoteTokenstorageErrorMessage } from './RemoteTokenStorage';

export type WebSocketSaveOptions = {
  commitMessage?: string;
};

export class WebSocketTokenStorage extends RemoteTokenStorage<WebSocketSaveOptions, SaveOption> {
  private id: string; // address

  private secret: string;

  public client: any;

  constructor(id: string, secret: string) {
    super();
    this.id = id;
    this.secret = secret;
  }

  public write(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  public read(): Promise<RemoteTokenstorageErrorMessage | RemoteTokenStorageFile<WebSocketSaveOptions>[]> {
    console.log('read');
    throw new Error('Method not implemented.');
  }

  public async connect() {
    console.log('connect token storage', this.secret, this.id, this.client);

    try {
      const client = await fbpClient({
        address: this.id,
        protocol: 'websocket', // TODO: check this
        secret: this.secret,
      });

      await client.connect();

      this.client = client;

      console.log('Connected to WebSocket: ', this.id);
    } catch (e: any) {
      console.error('Error connecting to WebSocket:', e.message);
    }
  }
}
