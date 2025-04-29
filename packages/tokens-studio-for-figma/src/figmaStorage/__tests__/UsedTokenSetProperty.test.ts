import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { mockRootGetSharedPluginData, mockRootSetSharedPluginData } from '../../../tests/__mocks__/figmaMock';
import { UsedTokenSetProperty } from '../UsedTokenSetProperty';

describe('UsedTokenSetProperty', () => {
  beforeEach(() => {
    mockRootSetSharedPluginData.mockClear();
    mockRootGetSharedPluginData.mockClear();
  });

  const mockUsedTokenSet = {
    global: TokenSetStatus.ENABLED,
  };

  it('should be able to write', async () => {
    await UsedTokenSetProperty.write(mockUsedTokenSet);

    // Find the actual data write call
    const writeCall = mockRootSetSharedPluginData.mock.calls.find(
      (call) => call[1] === 'usedTokenSet' && call[2] === JSON.stringify(mockUsedTokenSet),
    );

    expect(writeCall).toBeTruthy();
    expect(writeCall).toEqual(['tokens', 'usedTokenSet', JSON.stringify(mockUsedTokenSet)]);
  });

  it('should be able to read', async () => {
    mockRootGetSharedPluginData.mockReturnValueOnce(JSON.stringify(mockUsedTokenSet));
    expect(await UsedTokenSetProperty.read()).toEqual(mockUsedTokenSet);
  });
});
