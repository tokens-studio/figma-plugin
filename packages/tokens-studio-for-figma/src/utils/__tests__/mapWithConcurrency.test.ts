import { mapWithConcurrency } from '../mapWithConcurrency';

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

const flush = () => new Promise((resolve) => { setTimeout(resolve, 0); });

describe('mapWithConcurrency', () => {
  it('returns results in input order regardless of completion order', async () => {
    const result = await mapWithConcurrency([30, 10, 20], 3, (ms, index) => new Promise<string>((resolve) => {
      setTimeout(() => resolve(`${index}:${ms}`), ms);
    }));
    expect(result).toEqual(['0:30', '1:10', '2:20']);
  });

  it('never runs more than the given number of mappers at once', async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    const items = Array.from({ length: 25 }, (_, i) => i);

    const result = await mapWithConcurrency(items, 4, async (item) => {
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await flush();
      inFlight -= 1;
      return item * 2;
    });

    expect(maxInFlight).toBe(4);
    expect(result).toEqual(items.map((i) => i * 2));
  });

  it('starts the next item as soon as a slot frees up', async () => {
    const tasks = [deferred<number>(), deferred<number>(), deferred<number>()];
    const started: number[] = [];
    const promise = mapWithConcurrency([0, 1, 2], 2, (item) => {
      started.push(item);
      return tasks[item].promise;
    });

    await flush();
    expect(started).toEqual([0, 1]);

    tasks[1].resolve(1);
    await flush();
    expect(started).toEqual([0, 1, 2]);

    tasks[0].resolve(0);
    tasks[2].resolve(2);
    await expect(promise).resolves.toEqual([0, 1, 2]);
  });

  it('rejects with the first error and does not start further items', async () => {
    const mapper = jest.fn(async (item: number) => {
      await flush();
      if (item === 1) throw new Error('boom');
      return item;
    });

    await expect(mapWithConcurrency([0, 1, 2, 3, 4, 5], 2, mapper)).rejects.toThrow('boom');
    expect(mapper.mock.calls.length).toBeLessThan(6);
  });

  it('handles an empty list and nonsensical concurrency values', async () => {
    await expect(mapWithConcurrency([], 5, async (x) => x)).resolves.toEqual([]);
    await expect(mapWithConcurrency([1, 2], 0, async (x) => x)).resolves.toEqual([1, 2]);
    await expect(mapWithConcurrency([1, 2], 100, async (x) => x)).resolves.toEqual([1, 2]);
  });
});
