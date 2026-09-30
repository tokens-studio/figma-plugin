import { CanceledError } from './CanceledError';

type PoolFn = {
  run: () => Promise<void>;
  cancel: () => void;
};

export class Worker {
  private pool: Set<PoolFn> = new Set();

  private active: Set<PoolFn> = new Set();

  private flushResolvers: Set<() => void> = new Set();

  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  private running = false;

  private batchSize: number;

  constructor(batchSize = 30) {
    this.batchSize = batchSize;
  }

  public setBatchSize(size: number) {
    this.batchSize = size;
    this.scheduleTick();
  }

  private scheduleTick = () => {
    if (this.running && this.pool.size > 0 && this.active.size < this.batchSize && this.timeoutId === null) {
      this.timeoutId = setTimeout(this.tick, 0);
    }
  };

  private resolveFlushes() {
    if (this.pool.size === 0 && this.active.size === 0) {
      this.flushResolvers.forEach((resolve) => resolve());
      this.flushResolvers.clear();
    }
  }

  private tick = () => {
    this.timeoutId = null;
    while (this.running && this.pool.size > 0 && this.active.size < this.batchSize) {
      const item = this.pool.values().next().value;
      if (!item) break;

      this.pool.delete(item);
      this.active.add(item);
      item.run().finally(() => {
        this.active.delete(item);
        this.scheduleTick();
        this.resolveFlushes();
      });
    }
  };

  public schedule = <R>(fn: () => Promise<R>): Promise<R> => new Promise<R>((resolve, reject) => {
    const item: PoolFn = {
      run: async () => {
        try {
          resolve(await fn());
        } catch (error) {
          reject(error);
        }
      },
      cancel: () => reject(new CanceledError()),
    };
    this.pool.add(item);
    this.scheduleTick();
  });

  public cancel = () => {
    this.pool.forEach((item) => item.cancel());
    this.pool.clear();
    this.active.forEach((item) => item.cancel());
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.resolveFlushes();
  };

  public start = () => {
    this.running = true;
    this.scheduleTick();
  };

  public stop = () => {
    this.running = false;
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  };

  public async flush(): Promise<void> {
    if (this.pool.size === 0 && this.active.size === 0) return;
    this.start();
    await new Promise<void>((resolve) => {
      this.flushResolvers.add(resolve);
    });
  }
}

export const defaultWorker = new Worker();
defaultWorker.start();

// Create a specialized worker for variable creation with higher batch size
export const variableWorker = new Worker(100);
variableWorker.start();
