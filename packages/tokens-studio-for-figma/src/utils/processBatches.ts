// Process array in batches to avoid overwhelming Figma's API and memory limits
export async function processBatches<T>(
  items: T[],
  batchSize: number,
  processor: (item: T) => Promise<void>,
  onProgress?: (completed: number, total: number) => void | Promise<void>,
): Promise<void> {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.all(batch.map(processor));

    if (onProgress) {
      const completed = Math.min(i + batchSize, items.length);
      await onProgress(completed, items.length);
    }
  }
}
