import { compressToUTF16, decompressFromUTF16 } from 'lz-string';
import { ThemeObjectsList } from '@/types';
import { mockRootGetSharedPluginData, mockRootSetSharedPluginData } from '../../../tests/__mocks__/figmaMock';
import { ThemesProperty } from '../ThemesProperty';

describe('ThemesProperty', () => {
  const mockThemes: ThemeObjectsList = [
    {
      id: 'light',
      name: 'Light',
      selectedTokenSets: {},
    },
  ];

  it('should be able to write compressed data', async () => {
    const compressedValue = compressToUTF16(JSON.stringify(mockThemes));
    await ThemesProperty.write(compressedValue);
    expect(mockRootSetSharedPluginData).toHaveBeenCalledTimes(1);
    expect(mockRootSetSharedPluginData).toHaveBeenCalledWith('tokens', 'themes', compressedValue);
  });

  it('should be able to read and decompress data', async () => {
    const compressedValue = compressToUTF16(JSON.stringify(mockThemes));
    mockRootGetSharedPluginData.mockReturnValueOnce(compressedValue);
    const result = await ThemesProperty.read();
    const decompressedResult = decompressFromUTF16(result);
    expect(JSON.parse(decompressedResult)).toEqual(mockThemes);
  });

  it('should handle empty or invalid input when reading', async () => {
    mockRootGetSharedPluginData.mockReturnValueOnce(undefined);
    const emptyResult = await ThemesProperty.read();
    expect(emptyResult).toBe(null);

    mockRootGetSharedPluginData.mockReturnValueOnce(null);
    const nullResult = await ThemesProperty.read();
    expect(nullResult).toBe(null);
  });
});
