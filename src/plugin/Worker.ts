import EventEmitter from 'eventemitter3';
import { CanceledError } from './CanceledError';

type PoolFn = {
  id: number
  fn: () => Promise<any>
};

export class Worker {
  private schedulerId = 0;

  private pool: Set<PoolFn> = new Set();

  private emitter = new EventEmitter();

  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  private tick = async () => {
    let numberOfJobs = 0;

    const promises: Set<Promise<void>> = new Set();

    // eslint-disable-next-line
    for (const item of this.pool) {
      this.pool.delete(item);
      promises.add(new Promise((resolve) => {
        item.fn().then((result) => {
          this.emitter.emit(`completed/${item.id}`, result);
          resolve();
        });
      }));

      numberOfJobs += 1;
      if (numberOfJobs >= 30) {
        break;
      }
    }

    if (this.timeoutId !== null) {
      this.timeoutId = setTimeout(this.tick, 0);
    }

    await Promise.all(promises);
  };

  public schedule = <R extends any>(fn: () => Promise<R>) => {
    this.schedulerId += 1;
    const id = this.schedulerId;
    const promise = new Promise<R>((res, rej) => {
      this.emitter.once('canceled', () => {
        rej(new CanceledError());
      });
      this.emitter.once(`completed/${id}`, res);
    });
    this.pool.add({ id, fn });
    return promise;
  };

  public cancel = () => {
    this.pool.clear();
    this.emitter.emit('canceled', Date.now());
    this.emitter.removeAllListeners();
  };

  public start = () => {
    this.timeoutId = setTimeout(this.tick, 0);
  };

  public stop = () => {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  };
}

export const defaultWorker = new Worker();
defaultWorker.start();
