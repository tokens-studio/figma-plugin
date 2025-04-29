import { mockRootGetSharedPluginData, mockRootSetSharedPluginData } from '../../../tests/__mocks__/figmaMock';
import { ValuesProperty } from '../ValuesProperty';
import { TokenTypes } from '@/constants/TokenTypes';
import { AnyTokenList } from '@/types/tokens';

describe('ValuesProperty', () => {
  beforeEach(() => {
    mockRootSetSharedPluginData.mockClear();
    mockRootGetSharedPluginData.mockClear();
  });

  const mockValues: Record<string, AnyTokenList> = {
    global: [
      {
        type: TokenTypes.COLOR,
        name: 'colors.red',
        value: '#ff0000',
      },
    ],
  };

  it('should be able to write', async () => {
    await ValuesProperty.write(mockValues);

    // Find the actual data write call
    const writeCall = mockRootSetSharedPluginData.mock.calls.find(
      (call) => call[1] === 'values' && call[2] === JSON.stringify(mockValues),
    );

    expect(writeCall).toBeTruthy();
    expect(writeCall).toEqual(['tokens', 'values', JSON.stringify(mockValues)]);
  });

  it('should be able to read', async () => {
    mockRootGetSharedPluginData.mockReturnValueOnce(JSON.stringify(mockValues));
    expect(await ValuesProperty.read()).toEqual(mockValues);
  });
});
