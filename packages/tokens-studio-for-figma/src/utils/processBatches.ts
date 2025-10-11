// Process array in batches to avoid overwhelming Figma's API and memory limits
export async function processBatches<T>(
  items: T[],
  batchSize: number,
  processor: (item: T) => Promise<void>,
  onProgress?: (completed: number, total: number) => void | Promise<void>,
): Promise<void> {
  console.log('[PROCESS BATCHES] Starting with', items.length, 'items, batch size:', batchSize);
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    console.log('[PROCESS BATCHES] Processing batch', i, 'to', i + batchSize, '(', batch.length, 'items)');
    await Promise.all(batch.map(processor));
    console.log('[PROCESS BATCHES] Batch complete');

    if (onProgress) {
      const completed = Math.min(i + batchSize, items.length);
      console.log('[PROCESS BATCHES] Calling onProgress with completed:', completed, 'total:', items.length);
      await onProgress(completed, items.length);
    }
  }
  console.log('[PROCESS BATCHES] All batches complete');
}
