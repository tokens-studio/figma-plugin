import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { mockRootGetSharedPluginData, mockRootSetSharedPluginData } from '../../../tests/__mocks__/figmaMock';
import { UsedTokenSetProperty } from '../UsedTokenSetProperty';

describe('UsedTokenSetProperty', () => {
  const mockUsedTokenSet = {
    global: TokenSetStatus.ENABLED,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRootGetSharedPluginData.mockReset();
  });

  it('should be able to write', async () => {
    mockRootGetSharedPluginData.mockImplementation(() => null);

    await UsedTokenSetProperty.write(mockUsedTokenSet);

    expect(mockRootSetSharedPluginData).toHaveBeenCalledWith('tokens', 'usedTokenSet', JSON.stringify(mockUsedTokenSet));
  });

  it('should be able to read', async () => {
    mockRootGetSharedPluginData.mockImplementation(() => JSON.stringify(mockUsedTokenSet));

    expect(await UsedTokenSetProperty.read()).toEqual(mockUsedTokenSet);
  });

  it('should handle empty or invalid input when reading', async () => {
    mockRootGetSharedPluginData.mockImplementation(() => null);

    const emptyResult = await UsedTokenSetProperty.read();
    expect(emptyResult).toEqual(null);
  });
});
