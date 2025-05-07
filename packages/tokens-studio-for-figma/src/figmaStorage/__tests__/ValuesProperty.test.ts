import { compressToUTF16 } from 'lz-string';
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

  const compressedMockValues = compressToUTF16(JSON.stringify(mockValues));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be able to write', async () => {
    // Mock metadata check for single storage
    mockRootGetSharedPluginData.mockReturnValueOnce(null);

    await ValuesProperty.write(mockValues);

    // Should set metadata first (indicating single storage)
    expect(mockRootSetSharedPluginData).toHaveBeenCalledWith(
      'tokens',
      'values_meta',
      JSON.stringify({ type: 'single' })
    );

    expect(mockRootSetSharedPluginData).toHaveBeenCalledWith('tokens', 'values', compressedMockValues);
  });

  it('should be able to read', async () => {
    // Mock metadata indicating single storage
    mockRootGetSharedPluginData.mockReturnValueOnce(JSON.stringify({ type: 'single' }));

    // Mock the actual data
    mockRootGetSharedPluginData.mockReturnValueOnce(compressedMockValues);

    expect(await ValuesProperty.read(figma.root, true)).toEqual(mockValues);
  });

  it('should handle empty or invalid input when reading', async () => {
    // No metadata found, fallback to direct read
    mockRootGetSharedPluginData.mockReturnValueOnce(null);

    // No data found
    mockRootGetSharedPluginData.mockReturnValueOnce(undefined);
    const emptyResult = await ValuesProperty.read();
    expect(emptyResult).toEqual(null);

    // Reset mocks
    jest.clearAllMocks();

    // No metadata found, fallback to direct read
    mockRootGetSharedPluginData.mockReturnValueOnce(null);

    // Null data found
    mockRootGetSharedPluginData.mockReturnValueOnce(null);
    const nullResult = await ValuesProperty.read();
    expect(nullResult).toEqual(null);
  });
});
