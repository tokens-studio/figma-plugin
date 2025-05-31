import { compressToUTF16 } from 'lz-string';
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be able to write compressed data', async () => {
    // Mock metadata check for single storage
    mockRootGetSharedPluginData.mockReturnValueOnce(null);

    await ThemesProperty.write(mockThemes);

    // Should set metadata first (indicating single storage)
    expect(mockRootSetSharedPluginData).toHaveBeenCalledWith(
      'tokens',
      'themes_meta',
      JSON.stringify({ type: 'single' }),
    );

    // Then should set the actual data
    expect(mockRootSetSharedPluginData).toHaveBeenCalledWith(
      'tokens',
      'themes',
      compressedMockThemes,
    );
  });

  it('should be able to read', async () => {
    // Mock metadata indicating single storage
    mockRootGetSharedPluginData.mockReturnValueOnce(JSON.stringify({ type: 'single' }));

    // Mock the actual data
    mockRootGetSharedPluginData.mockReturnValueOnce(compressedMockThemes);

    expect(await ThemesProperty.read(figma.root, true)).toEqual(mockThemes);
  });

  it('should handle empty or invalid input when reading', async () => {
    // No metadata found, fallback to direct read
    mockRootGetSharedPluginData.mockReturnValueOnce(null);

    // No data found
    mockRootGetSharedPluginData.mockReturnValueOnce(undefined);
    const emptyResult = await ThemesProperty.read();
    expect(emptyResult).toEqual(null);

    // Reset mocks
    jest.clearAllMocks();

    // No metadata found, fallback to direct read
    mockRootGetSharedPluginData.mockReturnValueOnce(null);

    // Null data found
    mockRootGetSharedPluginData.mockReturnValueOnce(null);
    const nullResult = await ThemesProperty.read();
    expect(nullResult).toEqual(null);
  });
});
