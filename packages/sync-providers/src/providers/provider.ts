export type SyncState = 'idle' | 'syncing' | 'error' | 'success';

interface SyncProviderOptions {
  autoSyncInterval?: number;
}

interface EventListener {
  (data?: any): void;
}

interface StorageProvider {
  pull(): Promise<any>;
  push(data: any): Promise<void>;
  sync(data?: any): Promise<void>;
}

export class SyncProvider {
  private state: SyncState = 'idle';
  private eventListeners: Record<string, EventListener[]> = {};
  private provider: StorageProvider;
  private autoSyncInterval: number | undefined;
  // private syncIntervalId: NodeJS.Timeout | null = null;

  constructor(provider: StorageProvider, options?: SyncProviderOptions) {
    this.provider = provider;
    this.autoSyncInterval = options?.autoSyncInterval;

    if (this.autoSyncInterval) {
      // this.startAutoSync();
    }
  }

  getState(): SyncState {
    return this.state;
  }

  setState(newState: SyncState) {
    this.state = newState;
    this.triggerEvent('stateChange', newState);
  }

  on(event: string, listener: EventListener) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(listener);
  }

  private triggerEvent(event: string, data?: any) {
    const listeners = this.eventListeners[event];
    if (listeners) {
      listeners.forEach((listener) => listener(data));
    }
  }

  async pull() {
    this.setState('syncing');
    try {
      const data = await this.provider.pull();
      this.triggerEvent('pullSuccess', data);
      this.setState('success');
      return data;
    } catch (error) {
      this.triggerEvent('error', error);
      this.setState('error');
      throw error;
    }
  }

  async push(data: any) {
    this.setState('syncing');
    try {
      await this.provider.push(data);
      this.triggerEvent('pushSuccess');
      this.setState('success');
    } catch (error) {
      this.triggerEvent('error', error);
      this.setState('error');
      throw error;
    }
  }

  async sync(data?: any) {
    this.setState('syncing');
    try {
      await this.provider.sync(data);
      this.triggerEvent('syncSuccess');
      this.setState('success');
    } catch (error) {
      this.triggerEvent('error', error);
      this.setState('error');
      throw error;
    }
  }
}
