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
    // Mock keys
    mockKeysAsync.mockResolvedValue([
      'file123/tokens/values',
      'file123/themes/light',
      'file456/tokens/values',
      'file456/themes/dark',
      'otherKey'
    ]);

    await cleanupOldTokenPrefixes('file123');

    // Should delete keys not starting with file123
    expect(mockDeleteAsync).toHaveBeenCalledTimes(2);
    expect(mockDeleteAsync).toHaveBeenCalledWith('file456/tokens/values');
    expect(mockDeleteAsync).toHaveBeenCalledWith('file456/themes/dark');
  });

  it('should not delete keys that start with the current prefix', async () => {
    // Mock keys
    mockKeysAsync.mockResolvedValue([
      'file123/tokens/values',
      'file123/themes/light',
      'file456/tokens/values'
    ]);

    await cleanupOldTokenPrefixes('file123');

    // Should not delete keys starting with file123
    expect(mockDeleteAsync).not.toHaveBeenCalledWith('file123/tokens/values');
    expect(mockDeleteAsync).not.toHaveBeenCalledWith('file123/themes/light');
  });

  it('should handle empty storage', async () => {
    mockKeysAsync.mockResolvedValue([]);

    await cleanupOldTokenPrefixes('file123');
    expect(mockDeleteAsync).not.toHaveBeenCalled();
  });

  it('should only consider keys containing tokens or themes', async () => {
    // Mock keys
    mockKeysAsync.mockResolvedValue([
      'file123/tokens/values',
      'file456/themes/dark',
      'file789/other/data',
      'randomKey',
    ]);

    await cleanupOldTokenPrefixes('file123');

    // Should only delete file456/themes/dark, not the other non-token/theme keys
    expect(mockDeleteAsync).toHaveBeenCalledTimes(1);
    expect(mockDeleteAsync).toHaveBeenCalledWith('file456/themes/dark');
    expect(mockDeleteAsync).not.toHaveBeenCalledWith('file789/other/data');
    expect(mockDeleteAsync).not.toHaveBeenCalledWith('randomKey');
  });
});