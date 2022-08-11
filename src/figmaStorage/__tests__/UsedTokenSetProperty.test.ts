import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { mockRootGetSharedPluginData, mockRootSetSharedPluginData } from '../../../tests/__mocks__/figmaMock';
import { UsedTokenSetProperty } from '../UsedTokenSetProperty';

describe('UsedTokenSetProperty', () => {
  const mockUsedTokenSet = {
    global: TokenSetStatus.ENABLED,
  };

  it('should be able to write', async () => {
    await UsedTokenSetProperty.write(mockUsedTokenSet);
    expect(mockRootSetSharedPluginData).toBeCalledTimes(1);
    expect(mockRootSetSharedPluginData).toBeCalledWith('tokens', 'usedTokenSet', JSON.stringify(mockUsedTokenSet));
  });

  it('should be able to read', async () => {
    mockRootGetSharedPluginData.mockReturnValueOnce(JSON.stringify(mockUsedTokenSet));
    expect(await UsedTokenSetProperty.read()).toEqual(mockUsedTokenSet);
  });
});
