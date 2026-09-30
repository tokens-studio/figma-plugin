import { CanceledError } from './CanceledError';
import { Worker } from './Worker';

describe('Worker', () => {
  it('never starts more than its configured number of concurrent tasks', async () => {
    const worker = new Worker(2);
    let releaseTasks: () => void = () => {};
    const gate = new Promise<void>((resolve) => {
      releaseTasks = resolve;
    });
    let signalStarted: () => void = () => {};
    const twoStarted = new Promise<void>((resolve) => {
      signalStarted = resolve;
    });
    let started = 0;
    let active = 0;
    let maximumActive = 0;
    const tasks = Array.from({ length: 5 }, (_, index) => worker.schedule(async () => {
      started += 1;
      active += 1;
      maximumActive = Math.max(maximumActive, active);
      if (started === 2) signalStarted();
      await gate;
      active -= 1;
      return index;
    }));

    worker.start();
    await twoStarted;
    const startedBeforeRelease = started;
    releaseTasks();
    expect(await Promise.all(tasks)).toEqual([0, 1, 2, 3, 4]);
    await worker.flush();
    worker.stop();

    expect(startedBeforeRelease).toBe(2);
    expect(maximumActive).toBe(2);
  });

  it('drains thousands of jobs without exceeding the default concurrency limit', async () => {
    const worker = new Worker();
    let active = 0;
    let maximumActive = 0;
    const jobs = Array.from({ length: 2000 }, () => worker.schedule(async () => {
      active += 1;
      maximumActive = Math.max(maximumActive, active);
      await Promise.resolve();
      active -= 1;
    }));

    worker.start();
    await Promise.all(jobs);
    await worker.flush();
    worker.stop();

    expect(maximumActive).toBe(30);
  });

  it('rejects failed tasks and continues processing the queue', async () => {
    const worker = new Worker(1);
    const failed = worker.schedule(async () => {
      throw new Error('Failed task');
    });
    const failure = expect(failed).rejects.toThrow('Failed task');
    const next = worker.schedule(async () => 42);

    worker.start();
    await failure;
    await expect(next).resolves.toBe(42);
    await worker.flush();
    worker.stop();
  });

  it('rejects queued and active tasks on cancellation', async () => {
    const worker = new Worker(1);
    let releaseTask: () => void = () => {};
    const gate = new Promise<void>((resolve) => {
      releaseTask = resolve;
    });
    let signalStarted: () => void = () => {};
    const started = new Promise<void>((resolve) => {
      signalStarted = resolve;
    });
    const active = worker.schedule(async () => {
      signalStarted();
      await gate;
    });
    const queued = worker.schedule(async () => {});
    const results = Promise.allSettled([active, queued]);

    worker.start();
    await started;
    worker.cancel();
    releaseTask();
    expect(
      (await results).every((result) => result.status === 'rejected' && result.reason instanceof CanceledError),
    ).toBe(true);
    await worker.flush();
    worker.stop();
  });
});
