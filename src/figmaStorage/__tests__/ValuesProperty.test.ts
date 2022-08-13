import { TokenTypes } from '@/constants/TokenTypes';
import { AnyTokenList } from '@/types/tokens';
import { mockRootGetSharedPluginData, mockRootSetSharedPluginData } from '../../../tests/__mocks__/figmaMock';
import { ValuesProperty } from '../ValuesProperty';

describe('ValuesProperty', () => {
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
    expect(mockRootSetSharedPluginData).toBeCalledTimes(1);
    expect(mockRootSetSharedPluginData).toBeCalledWith('tokens', 'values', JSON.stringify(mockValues));
  });

  it('should be able to read', async () => {
    mockRootGetSharedPluginData.mockReturnValueOnce(JSON.stringify(mockValues));
    expect(await ValuesProperty.read()).toEqual(mockValues);
  });
});
