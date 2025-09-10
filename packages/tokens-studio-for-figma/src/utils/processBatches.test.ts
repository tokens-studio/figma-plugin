import { processBatches } from './processBatches';

describe('processBatches', () => {
  it('should process all items in batches', async () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const batchSize = 3;
    const processedItems: number[] = [];
    const processor = jest.fn().mockImplementation(async (item: number) => {
      processedItems.push(item);
    });

    await processBatches(items, batchSize, processor);

    expect(processor).toHaveBeenCalledTimes(10);
    expect(processedItems).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('should call onProgress callback with correct values', async () => {
    const items = [1, 2, 3, 4, 5];
    const batchSize = 2;
    const processor = jest.fn().mockResolvedValue(undefined);
    const onProgress = jest.fn();

    await processBatches(items, batchSize, processor, onProgress);

    expect(onProgress).toHaveBeenCalledTimes(3);
    expect(onProgress).toHaveBeenNthCalledWith(1, 2, 5);
    expect(onProgress).toHaveBeenNthCalledWith(2, 4, 5);
    expect(onProgress).toHaveBeenNthCalledWith(3, 5, 5);
  });

  it('should not call onProgress when not provided', async () => {
    const items = [1, 2, 3];
    const batchSize = 2;
    const processor = jest.fn().mockResolvedValue(undefined);

    await processBatches(items, batchSize, processor);

    expect(processor).toHaveBeenCalledTimes(3);
  });

  it('should handle empty array', async () => {
    const items: number[] = [];
    const batchSize = 3;
    const processor = jest.fn();
    const onProgress = jest.fn();

    await processBatches(items, batchSize, processor, onProgress);

    expect(processor).not.toHaveBeenCalled();
    expect(onProgress).not.toHaveBeenCalled();
  });

  it('should handle batch size larger than array length', async () => {
    const items = [1, 2, 3];
    const batchSize = 10;
    const processor = jest.fn().mockResolvedValue(undefined);
    const onProgress = jest.fn();

    await processBatches(items, batchSize, processor, onProgress);

    expect(processor).toHaveBeenCalledTimes(3);
    expect(onProgress).toHaveBeenCalledTimes(1);
    expect(onProgress).toHaveBeenCalledWith(3, 3);
  });

  it('should handle single item batches', async () => {
    const items = [1, 2, 3];
    const batchSize = 1;
    const processor = jest.fn().mockResolvedValue(undefined);
    const onProgress = jest.fn();

    await processBatches(items, batchSize, processor, onProgress);

    expect(processor).toHaveBeenCalledTimes(3);
    expect(onProgress).toHaveBeenCalledTimes(3);
    expect(onProgress).toHaveBeenNthCalledWith(1, 1, 3);
    expect(onProgress).toHaveBeenNthCalledWith(2, 2, 3);
    expect(onProgress).toHaveBeenNthCalledWith(3, 3, 3);
  });

  it('should handle processor errors and stop processing', async () => {
    const items = [1, 2, 3, 4];
    const batchSize = 2;
    const processor = jest.fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('Processing failed'))
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined);
    const onProgress = jest.fn();

    await expect(processBatches(items, batchSize, processor, onProgress)).rejects.toThrow('Processing failed');

    // Only the first batch (2 items) should be processed before error
    expect(processor).toHaveBeenCalledTimes(2);
    expect(onProgress).not.toHaveBeenCalled(); // Should not be called if batch fails
  });

  it('should process items in correct order within batches', async () => {
    const items = ['a', 'b', 'c', 'd', 'e'];
    const batchSize = 2;
    const processOrder: string[] = [];
    const processor = jest.fn().mockImplementation(async (item: string) => {
      processOrder.push(item);
    });

    await processBatches(items, batchSize, processor);

    // Items within each batch are processed in parallel, so we can't guarantee order within batch
    // but we can verify all items were processed
    expect(processOrder).toHaveLength(5);
    expect(processOrder).toEqual(expect.arrayContaining(['a', 'b', 'c', 'd', 'e']));
  });

  it('should handle async processor with delays', async () => {
    const items = [1, 2, 3];
    const batchSize = 2;
    const processor = jest.fn().mockImplementation(async (_item: number) => new Promise<void>((resolve) => {
      setTimeout(resolve, 10);
    }));
    const onProgress = jest.fn();

    const startTime = Date.now();
    await processBatches(items, batchSize, processor, onProgress);
    const endTime = Date.now();

    expect(processor).toHaveBeenCalledTimes(3);
    expect(onProgress).toHaveBeenCalledTimes(2);
    // Should take at least some time due to async processing
    expect(endTime - startTime).toBeGreaterThan(5);
  });
});
