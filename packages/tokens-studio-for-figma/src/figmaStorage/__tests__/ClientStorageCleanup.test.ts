import { cleanupOldTokenPrefixes } from '../ClientStorageCleanup';

// Mock the Figma API
const mockKeysAsync = jest.fn();
const mockDeleteAsync = jest.fn();

// Mock the global figma object
global.figma = {
  clientStorage: {
    keysAsync: mockKeysAsync,
    deleteAsync: mockDeleteAsync,
  },
} as any;

describe('ClientStorageCleanup', () => {
  beforeEach(() => {
    // Reset mocks
    mockKeysAsync.mockReset();
    mockDeleteAsync.mockReset();
  });

  it('should delete keys from other prefixes', async () => {
    // Mock keys with the correct format
    mockKeysAsync.mockResolvedValue([
      'file123/tokens/values',
      'file123/tokens/themes',
      'file456/tokens/values',
      'file456/tokens/themes',
      'otherKey',
    ]);

    await cleanupOldTokenPrefixes('file123');

    // Should delete keys not starting with file123
    expect(mockDeleteAsync).toHaveBeenCalledTimes(2);
    expect(mockDeleteAsync).toHaveBeenCalledWith('file456/tokens/values');
    expect(mockDeleteAsync).toHaveBeenCalledWith('file456/tokens/themes');
  });

  it('should not delete keys that start with the current prefix', async () => {
    // Mock keys with the correct format
    mockKeysAsync.mockResolvedValue([
      'file123/tokens/values',
      'file123/tokens/themes',
      'file456/tokens/values',
    ]);

    await cleanupOldTokenPrefixes('file123');

    // Should not delete keys starting with file123
    expect(mockDeleteAsync).not.toHaveBeenCalledWith('file123/tokens/values');
    expect(mockDeleteAsync).not.toHaveBeenCalledWith('file123/tokens/themes');
  });

  it('should handle empty storage', async () => {
    mockKeysAsync.mockResolvedValue([]);

    await cleanupOldTokenPrefixes('file123');
    expect(mockDeleteAsync).not.toHaveBeenCalled();
  });

  it('should only consider keys containing /tokens/', async () => {
    // Mock keys with the correct format
    mockKeysAsync.mockResolvedValue([
      'file123/tokens/values',
      'file456/tokens/themes',
      'file789/other/data',
      'randomKey',
    ]);

    await cleanupOldTokenPrefixes('file123');

    // Should only delete keys with /tokens/ pattern, not other keys
    expect(mockDeleteAsync).toHaveBeenCalledTimes(1);
    expect(mockDeleteAsync).toHaveBeenCalledWith('file456/tokens/themes');
    expect(mockDeleteAsync).not.toHaveBeenCalledWith('file789/other/data');
    expect(mockDeleteAsync).not.toHaveBeenCalledWith('randomKey');
  });
});
