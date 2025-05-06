import { getStorageSize } from '../StorageSizeManager';
import { mockGetAsync, mockKeysAsync } from '../../../tests/__mocks__/figmaMock';

describe('StorageSizeManager', () => {
  beforeEach(() => {
    // Reset mocks
    mockKeysAsync.mockReset();
    mockGetAsync.mockReset();
  });

  it('should calculate storage size correctly', async () => {
    // Mock keys
    mockKeysAsync.mockResolvedValue([
      'file123/tokens/values',
      'file123/tokens/themes',
      'file456/tokens/values',
      'otherKey',
    ]);

    // Mock values with different sizes
    mockGetAsync.mockImplementation((key) => {
      if (key === 'file123/tokens/values') return Promise.resolve('a'.repeat(100));
      if (key === 'file123/tokens/themes') return Promise.resolve('b'.repeat(50));
      if (key === 'file456/tokens/values') return Promise.resolve('c'.repeat(200));
      return Promise.resolve(null);
    });

    const size = await getStorageSize();
    // Expected: (100 + 50 + 200) * 2 = 700 bytes
    expect(size).toBe(700);
    expect(mockKeysAsync).toHaveBeenCalledTimes(1);
    expect(mockGetAsync).toHaveBeenCalledTimes(3);
  });
});
