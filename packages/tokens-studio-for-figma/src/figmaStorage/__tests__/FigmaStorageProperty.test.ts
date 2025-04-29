import { FigmaStorageProperty, FigmaStorageType } from '../FigmaStorageProperty';
import {
  mockGetAsync, mockSetAsync, mockRootGetSharedPluginData, mockRootSetSharedPluginData,
} from '../../../tests/__mocks__/figmaMock';

// Single mock TextEncoder implementation that can be configured per test
const createMockTextEncoder = (lengthImpl: (str: string) => number) => class {
  encode(_str: string) {
    return {
      length: lengthImpl(_str),
    };
  }
} as any;

// Mock TextEncoder with default implementation
global.TextEncoder = createMockTextEncoder((_str) => _str.length);

describe('FigmaStorageProperty', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CLIENT_STORAGE', () => {
    const property = new FigmaStorageProperty<string>(
      FigmaStorageType.CLIENT_STORAGE,
      'test-key',
    );

    it('should read from client storage', async () => {
      mockGetAsync.mockResolvedValueOnce('test-value');
      const result = await property.read();
      expect(result).toBe('test-value');
      expect(mockGetAsync).toHaveBeenCalledWith('test-key');
    });

    it('should write to client storage', async () => {
      await property.write('test-value');
      expect(mockSetAsync).toHaveBeenCalledWith('test-key', 'test-value');
    });
  });

  describe('SHARED_PLUGIN_DATA', () => {
    const property = new FigmaStorageProperty<string>(
      FigmaStorageType.SHARED_PLUGIN_DATA,
      'namespace/test-key',
    );

    describe('Single value (no chunking needed)', () => {
      it('should read a single value with metadata', async () => {
        // Mock metadata indicating a single value
        mockRootGetSharedPluginData.mockImplementation((namespace, key) => {
          if (key === 'test-key_meta') {
            return JSON.stringify({ type: 'single' });
          }
          if (key === 'test-key') {
            return 'test-value';
          }
          return '';
        });

        const result = await property.read();
        expect(result).toBe('test-value');
      });

      it('should read a single value without metadata (backward compatibility)', async () => {
        // Mock no metadata but a value exists
        mockRootGetSharedPluginData.mockImplementation((namespace, key) => {
          if (key === 'test-key') {
            return 'test-value';
          }
          return '';
        });

        const result = await property.read();
        expect(result).toBe('test-value');
      });

      it('should write a single value with metadata', async () => {
        await property.write('test-value');

        // Should set metadata
        expect(mockRootSetSharedPluginData).toHaveBeenCalledWith(
          'namespace',
          'test-key_meta',
          JSON.stringify({ type: 'single' }),
        );

        // Should set the value
        expect(mockRootSetSharedPluginData).toHaveBeenCalledWith(
          'namespace',
          'test-key',
          'test-value',
        );
      });
    });

    describe('Chunked values', () => {
      it('should read chunked values', async () => {
        // Mock metadata indicating chunked values
        mockRootGetSharedPluginData.mockImplementation((namespace, key) => {
          if (key === 'test-key_meta') {
            return JSON.stringify({ type: 'chunked', count: 3 });
          }
          if (key === 'test-key_chunk_0') {
            return 'chunk1';
          }
          if (key === 'test-key_chunk_1') {
            return 'chunk2';
          }
          if (key === 'test-key_chunk_2') {
            return 'chunk3';
          }
          return '';
        });

        const result = await property.read();
        expect(result).toBe('chunk1chunk2chunk3');
      });

      it('should write chunked values when data is large', async () => {
        // Mock TextEncoder to simulate large data
        const originalTextEncoder = global.TextEncoder;
        global.TextEncoder = createMockTextEncoder((_str) => 100000);

        const largeValue = 'large-value';
        await property.write(largeValue);

        // Should set metadata for chunked storage
        expect(mockRootSetSharedPluginData).toHaveBeenCalledWith(
          'namespace',
          'test-key_meta',
          expect.stringContaining('"type":"chunked"'),
        );

        // Should set chunks
        expect(mockRootSetSharedPluginData).toHaveBeenCalledWith(
          'namespace',
          'test-key_chunk_0',
          expect.any(String),
        );

        // Should clear the main key
        expect(mockRootSetSharedPluginData).toHaveBeenCalledWith(
          'namespace',
          'test-key',
          '',
        );

        // Restore original TextEncoder
        global.TextEncoder = originalTextEncoder;
      });

      it('should handle missing chunks', async () => {
        // Mock metadata indicating chunked values but missing a chunk
        mockRootGetSharedPluginData.mockImplementation((namespace, key) => {
          if (key === 'test-key_meta') {
            return JSON.stringify({ type: 'chunked', count: 3 });
          }
          if (key === 'test-key_chunk_0') {
            return 'chunk1';
          }
          if (key === 'test-key_chunk_1') {
            return 'chunk2';
          }
          // Chunk 2 is missing
          return '';
        });

        const result = await property.read();
        expect(result).toBeNull();
      });
    });

    describe('Cleanup', () => {
      it('should clean up old chunks when switching from chunked to single', async () => {
        // Mock existing chunked metadata
        mockRootGetSharedPluginData.mockImplementation((namespace, key) => {
          if (key === 'test-key_meta') {
            return JSON.stringify({ type: 'chunked', count: 2 });
          }
          return '';
        });

        await property.write('small-value');

        // Should clean up old chunks
        expect(mockRootSetSharedPluginData).toHaveBeenCalledWith(
          'namespace',
          'test-key_chunk_0',
          '',
        );
        expect(mockRootSetSharedPluginData).toHaveBeenCalledWith(
          'namespace',
          'test-key_chunk_1',
          '',
        );
      });

      it('should clean up obsolete chunks when number of chunks decreases', async () => {
        // Mock TextEncoder to simulate large data that will result in exactly 2 chunks
        const originalTextEncoder = global.TextEncoder;

        // Create a specific mock implementation that returns different sizes
        let encoderCallCount = 0;
        const MockTextEncoder = createMockTextEncoder((_str: string) => {
          encoderCallCount += 1;
          // First call (for metadata) returns small size
          // Second call (for actual data) returns size for 2 chunks
          return encoderCallCount === 1 ? 100 : 180 * 1024; // Will create 2 chunks
        });

        global.TextEncoder = MockTextEncoder;

        // Mock existing chunked metadata with 3 chunks
        mockRootGetSharedPluginData.mockImplementation((namespace, key) => {
          if (key === 'test-key_meta') {
            return JSON.stringify({ type: 'chunked', count: 3 });
          }
          return '';
        });

        // Reset the mock before writing
        mockRootSetSharedPluginData.mockClear();

        // Write a value that will be split into 2 chunks
        await property.write('new-value');

        // Verify that the obsolete third chunk is cleaned up
        const { calls } = mockRootSetSharedPluginData.mock;
        const cleanupCall = calls.find((call) => call[0] === 'namespace'
          && call[1] === 'test-key_chunk_2'
          && call[2] === '');

        expect(cleanupCall).toBeTruthy();

        // Restore original TextEncoder
        global.TextEncoder = originalTextEncoder;
      });
    });
  });
});
