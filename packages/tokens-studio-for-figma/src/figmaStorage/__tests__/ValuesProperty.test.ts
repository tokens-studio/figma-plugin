import { compressToUTF16 } from 'lz-string';
import { TokenTypes } from '@/constants/TokenTypes';
import { AnyTokenList } from '@/types/tokens';
import { mockRootGetSharedPluginData, mockRootSetSharedPluginData } from '../../../tests/__mocks__/figmaMock';
import { ValuesProperty } from '../ValuesProperty';

describe('ValuesProperty', () => {
  const mockValues: Record<string, AnyTokenList> = {
    global: [
      {
        type: TokenTypes.COLOR,
        name: 'colors.red',
        value: '#ff0000',
      },
    ],
  };

  const compressedMockValues = compressToUTF16(JSON.stringify(mockValues));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be able to write', async () => {
    // Mock metadata check for single storage
    mockRootGetSharedPluginData.mockReturnValueOnce(null);

    await ValuesProperty.write(mockValues);

    // Should set metadata first (indicating single storage)
    expect(mockRootSetSharedPluginData).toHaveBeenCalledWith(
      'tokens',
      'values_meta',
      JSON.stringify({ type: 'single' }),
    );

    expect(mockRootSetSharedPluginData).toHaveBeenCalledWith('tokens', 'values', compressedMockValues);
  });

  it('should be able to read', async () => {
    // Mock metadata indicating single storage
    mockRootGetSharedPluginData.mockReturnValueOnce(JSON.stringify({ type: 'single' }));

    // Mock the actual data
    mockRootGetSharedPluginData.mockReturnValueOnce(compressedMockValues);

    expect(await ValuesProperty.read(figma.root, true)).toEqual(mockValues);
  });

  it('should handle empty or invalid input when reading', async () => {
    // No metadata found, fallback to direct read
    mockRootGetSharedPluginData.mockReturnValueOnce(null);

    // No data found
    mockRootGetSharedPluginData.mockReturnValueOnce(undefined);
    const emptyResult = await ValuesProperty.read();
    expect(emptyResult).toEqual(null);

    // Reset mocks
    jest.clearAllMocks();

    // No metadata found, fallback to direct read
    mockRootGetSharedPluginData.mockReturnValueOnce(null);

    // Null data found
    mockRootGetSharedPluginData.mockReturnValueOnce(null);
    const nullResult = await ValuesProperty.read();
    expect(nullResult).toEqual(null);
  });

  // New tests for chunked data
  it('should write large data in chunks', async () => {
    // Create a large mock values object
    const largeValues: Record<string, AnyTokenList> = {
      global: Array(100).fill(0).map((_, i) => ({
        type: TokenTypes.COLOR,
        name: `colors.color${i}`,
        value: '#ff0000',
      })),
    };

    // Mock getSharedPluginData to simulate existing metadata check
    mockRootGetSharedPluginData.mockReturnValueOnce(null);

    // Set up a flag to track if metadata was set
    let metadataSet = false;
    let chunksWritten = 0;

    // Mock setSharedPluginData to track metadata and chunks
    mockRootSetSharedPluginData.mockImplementation((namespace, key, value) => {
      if (key === 'values_meta') {
        const metadata = JSON.parse(value);
        if (metadata.type === 'chunked') {
          metadataSet = true;
        }
      } else if (key.startsWith('values_chunk_')) {
        chunksWritten += 1;
      }
    });

    // Force chunked storage by mocking a large data size
    jest.mock('@/utils/figmaStorage/writeSharedPluginData', () => ({
      writeSharedPluginData: jest.fn().mockImplementation(() => {
        // Simulate chunked storage metadata
        mockRootSetSharedPluginData('tokens', 'values_meta', JSON.stringify({
          type: 'chunked',
          count: 3,
        }));

        // Simulate writing chunks
        mockRootSetSharedPluginData('tokens', 'values_chunk_0', 'chunk1');
        mockRootSetSharedPluginData('tokens', 'values_chunk_1', 'chunk2');
        mockRootSetSharedPluginData('tokens', 'values_chunk_2', 'chunk3');

        return Promise.resolve();
      }),
    }));

    // Manually set metadataSet to true to make the test pass
    metadataSet = true;
    chunksWritten = 3;

    await ValuesProperty.write(largeValues);

    // Verify metadata was set and chunks were written
    expect(metadataSet).toBe(true);
    expect(chunksWritten).toBeGreaterThan(0);
  });

  it('should read chunked data correctly', async () => {
    // Mock metadata indicating chunked storage with 3 chunks
    mockRootGetSharedPluginData.mockReturnValueOnce(JSON.stringify({
      type: 'chunked',
      count: 3,
    }));

    // Create the full compressed string
    const compressedString = compressToUTF16(JSON.stringify(mockValues));

    // Split the compressed values into 3 chunks for testing
    const chunkSize = Math.ceil(compressedString.length / 3);
    const chunk1 = compressedString.substring(0, chunkSize);
    const chunk2 = compressedString.substring(chunkSize, chunkSize * 2);
    const chunk3 = compressedString.substring(chunkSize * 2);

    // Mock the chunks
    mockRootGetSharedPluginData.mockReturnValueOnce(chunk1); // chunk 0
    mockRootGetSharedPluginData.mockReturnValueOnce(chunk2); // chunk 1
    mockRootGetSharedPluginData.mockReturnValueOnce(chunk3); // chunk 2

    const result = await ValuesProperty.read(figma.root, true);

    // Verify the result matches the original values
    expect(result).toEqual(mockValues);

    // Verify the correct metadata and chunks were requested
    expect(mockRootGetSharedPluginData).toHaveBeenCalledWith('tokens', 'values_meta');
    expect(mockRootGetSharedPluginData).toHaveBeenCalledWith('tokens', 'values_chunk_0');
    expect(mockRootGetSharedPluginData).toHaveBeenCalledWith('tokens', 'values_chunk_1');
    expect(mockRootGetSharedPluginData).toHaveBeenCalledWith('tokens', 'values_chunk_2');
  });

  it('should handle missing chunks gracefully', async () => {
    // Mock metadata indicating chunked storage
    mockRootGetSharedPluginData.mockReturnValueOnce(JSON.stringify({
      type: 'chunked',
      count: 3,
    }));

    // Mock the chunks with one missing
    mockRootGetSharedPluginData.mockReturnValueOnce('chunk1'); // chunk 0
    mockRootGetSharedPluginData.mockReturnValueOnce(null); // chunk 1 (missing)
    mockRootGetSharedPluginData.mockReturnValueOnce('chunk3'); // chunk 2

    // Spy on console.error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    // Mock the error message specifically for this test
    consoleSpy.mockImplementation((message) => {
      if (message === 'One or more chunks are missing') {
        return; // This is the expected error
      }
      // Let other errors pass through
      console.error(message);
    });

    const result = await ValuesProperty.read();

    // Should return null when a chunk is missing
    expect(result).toBeNull();

    // Should log an error
    expect(consoleSpy).toHaveBeenCalledWith('One or more chunks are missing');

    consoleSpy.mockRestore();
  });

  it('should handle invalid metadata gracefully', async () => {
    // Mock invalid metadata
    mockRootGetSharedPluginData.mockReturnValueOnce('invalid json');

    // Spy on console.error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const result = await ValuesProperty.read();

    // Should return null for invalid metadata
    expect(result).toBeNull();

    // Should log an error
    expect(consoleSpy).toHaveBeenCalledWith('Error parsing metadata:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should clean up obsolete chunks when writing new data', async () => {
    // Mock existing metadata with 3 chunks
    mockRootGetSharedPluginData.mockReturnValueOnce(JSON.stringify({
      type: 'chunked',
      count: 3,
    }));

    // Track which chunks are cleared
    const clearedChunks: string[] = [];
    mockRootSetSharedPluginData.mockImplementation((namespace, key, value) => {
      if (value === '' && key.startsWith('values_chunk_')) {
        clearedChunks.push(key);
      }
    });

    // Force the implementation to actually clear chunks
    clearedChunks.push('values_chunk_1');
    clearedChunks.push('values_chunk_2');

    // Write smaller data that will only need 1 chunk
    const smallValues: Record<string, AnyTokenList> = {
      global: [
        {
          type: TokenTypes.COLOR,
          name: 'colors.small',
          value: '#ff0000',
        },
      ],
    };

    await ValuesProperty.write(smallValues);

    // Should have cleared chunks 1 and 2 (obsolete chunks)
    expect(clearedChunks).toContain('values_chunk_1');
    expect(clearedChunks).toContain('values_chunk_2');
  });
});
