import { readSharedPluginData } from '../readSharedPluginData';

describe('readSharedPluginData', () => {
  // Mock Figma node
  const mockNode = {
    getSharedPluginData: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should read single chunk data', async () => {
    // Mock metadata indicating single storage
    mockNode.getSharedPluginData.mockImplementation((namespace, key) => {
      if (key === 'values_meta') {
        return JSON.stringify({ type: 'single' });
      }
      if (key === 'values') {
        return 'test value';
      }
      return null;
    });

    const result = await readSharedPluginData('namespace', 'values', mockNode as unknown as BaseNode);
    expect(result).toBe('test value');
    expect(mockNode.getSharedPluginData).toHaveBeenCalledWith('namespace', 'values_meta');
    expect(mockNode.getSharedPluginData).toHaveBeenCalledWith('namespace', 'values');
  });

  it('should read chunked data', async () => {
    // Mock metadata indicating chunked storage
    mockNode.getSharedPluginData.mockImplementation((namespace, key) => {
      if (key === 'values_meta') {
        return JSON.stringify({ type: 'chunked', count: 3 });
      }
      if (key === 'values_chunk_0') {
        return 'chunk1';
      }
      if (key === 'values_chunk_1') {
        return 'chunk2';
      }
      if (key === 'values_chunk_2') {
        return 'chunk3';
      }
      return null;
    });

    const result = await readSharedPluginData('namespace', 'values', mockNode as unknown as BaseNode);
    expect(result).toBe('chunk1chunk2chunk3');

    // Should check metadata
    expect(mockNode.getSharedPluginData).toHaveBeenCalledWith('namespace', 'values_meta');

    // Should read all chunks
    expect(mockNode.getSharedPluginData).toHaveBeenCalledWith('namespace', 'values_chunk_0');
    expect(mockNode.getSharedPluginData).toHaveBeenCalledWith('namespace', 'values_chunk_1');
    expect(mockNode.getSharedPluginData).toHaveBeenCalledWith('namespace', 'values_chunk_2');
  });

  it('should return null if a chunk is missing', async () => {
    // Mock metadata indicating chunked storage
    mockNode.getSharedPluginData.mockImplementation((namespace, key) => {
      if (key === 'values_meta') {
        return JSON.stringify({ type: 'chunked', count: 3 });
      }
      if (key === 'values_chunk_0') {
        return 'chunk1';
      }
      if (key === 'values_chunk_1') {
        return null; // Missing chunk
      }
      if (key === 'values_chunk_2') {
        return 'chunk3';
      }
      return null;
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const result = await readSharedPluginData('namespace', 'values', mockNode as unknown as BaseNode);
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith('One or more chunks are missing');

    consoleSpy.mockRestore();
  });

  it('should handle invalid metadata', async () => {
    // Mock invalid metadata
    mockNode.getSharedPluginData.mockImplementation((namespace, key) => {
      if (key === 'values_meta') {
        return 'invalid json';
      }
      return null;
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const result = await readSharedPluginData('namespace', 'values', mockNode as unknown as BaseNode);
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith('Error parsing metadata:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should handle unknown metadata type', async () => {
    // Mock unknown metadata type
    mockNode.getSharedPluginData.mockImplementation((namespace, key) => {
      if (key === 'values_meta') {
        return JSON.stringify({ type: 'unknown' });
      }
      return null;
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const result = await readSharedPluginData('namespace', 'values', mockNode as unknown as BaseNode);
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith('Unknown metadata type or missing count:', { type: 'unknown' });

    consoleSpy.mockRestore();
  });

  it('should fall back to direct read if no metadata is found', async () => {
    // No metadata, but direct value exists
    mockNode.getSharedPluginData.mockImplementation((namespace, key) => {
      if (key === 'values_meta') {
        return null;
      }
      if (key === 'values') {
        return 'direct value';
      }
      return null;
    });

    const result = await readSharedPluginData('namespace', 'values', mockNode as unknown as BaseNode);
    expect(result).toBe('direct value');
  });

  it('should return null if no data is found', async () => {
    // No metadata, no direct value
    mockNode.getSharedPluginData.mockReturnValue(null);

    const result = await readSharedPluginData('namespace', 'values', mockNode as unknown as BaseNode);
    expect(result).toBeNull();
  });
});
