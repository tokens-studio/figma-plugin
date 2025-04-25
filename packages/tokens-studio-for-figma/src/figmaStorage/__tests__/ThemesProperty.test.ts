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

  const compressedMockThemes = compressToUTF16(JSON.stringify(mockThemes));

  it('should be able to write compressed data', async () => {
    await ThemesProperty.write(mockThemes);
    expect(mockRootSetSharedPluginData).toHaveBeenCalledTimes(1);
    expect(mockRootSetSharedPluginData).toHaveBeenCalledWith('tokens', 'themes', compressedMockThemes);
  });

  it('should be able to read', async () => {
    mockRootGetSharedPluginData.mockReturnValueOnce(JSON.stringify(mockThemes));
    expect(await ThemesProperty.read()).toEqual(mockThemes);
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
