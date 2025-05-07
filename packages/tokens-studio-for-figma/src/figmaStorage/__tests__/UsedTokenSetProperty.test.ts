import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { mockRootGetSharedPluginData, mockRootSetSharedPluginData } from '../../../tests/__mocks__/figmaMock';
import { UsedTokenSetProperty } from '../UsedTokenSetProperty';

describe('UsedTokenSetProperty', () => {
  const mockUsedTokenSet = {
    global: TokenSetStatus.ENABLED,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be able to write', async () => {
    // Mock metadata check for single storage
    mockRootGetSharedPluginData.mockReturnValueOnce(null);

    await UsedTokenSetProperty.write(mockUsedTokenSet);

    // Should set metadata first (indicating single storage)
    expect(mockRootSetSharedPluginData).toHaveBeenCalledWith(
      'tokens', 
      'usedTokenSet_meta', 
      JSON.stringify({ type: 'single' })
    );

    expect(mockRootSetSharedPluginData).toHaveBeenCalledWith(
      'tokens',
      'usedTokenSet',
      JSON.stringify(mockUsedTokenSet),
    );
  });

  it('should be able to read', async () => {
    // Mock metadata indicating single storage
    mockRootGetSharedPluginData.mockReturnValueOnce(JSON.stringify({ type: 'single' }));

    // Mock the actual data
    mockRootGetSharedPluginData.mockReturnValueOnce(JSON.stringify(mockUsedTokenSet));

    expect(await UsedTokenSetProperty.read()).toEqual(mockUsedTokenSet);
  });

  it('should handle empty or invalid input when reading', async () => {
    // No metadata found, fallback to direct read
    mockRootGetSharedPluginData.mockReturnValueOnce(null);

    // No data found
    mockRootGetSharedPluginData.mockReturnValueOnce(undefined);
    const emptyResult = await UsedTokenSetProperty.read();
    expect(emptyResult).toEqual(null);

    // Reset mocks
    jest.clearAllMocks();

    // No metadata found, fallback to direct read
    mockRootGetSharedPluginData.mockReturnValueOnce(null);

    // Null data found
    mockRootGetSharedPluginData.mockReturnValueOnce(null);
    const nullResult = await UsedTokenSetProperty.read();
    expect(nullResult).toEqual(null);
  });
});
