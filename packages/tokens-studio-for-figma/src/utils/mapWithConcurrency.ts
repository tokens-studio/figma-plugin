// Like Promise.all(items.map(mapper)), but with at most `concurrency` mappers in flight at once.
// Results keep the input order. The first rejection rejects the whole call and stops new work from starting.
export async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  const workerCount = Math.max(1, Math.min(Math.floor(concurrency) || 1, items.length));
  let nextIndex = 0;
  let failed = false;

  const worker = async () => {
    while (!failed && nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      try {
        results[index] = await mapper(items[index], index);
      } catch (error) {
        failed = true;
        throw error;
      }
    }
  };

  await Promise.all(Array.from({ length: workerCount }, worker));
  return results;
}
