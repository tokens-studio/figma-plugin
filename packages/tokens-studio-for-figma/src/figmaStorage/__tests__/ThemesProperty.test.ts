import { compressToUTF16, decompressFromUTF16 } from 'lz-string';
import { ThemeObjectsList } from '@/types';
import { mockRootGetSharedPluginData, mockRootSetSharedPluginData } from '../../../tests/__mocks__/figmaMock';
import { ThemesProperty } from '../ThemesProperty';

describe('ThemesProperty', () => {
  beforeEach(() => {
    mockRootSetSharedPluginData.mockClear();
    mockRootGetSharedPluginData.mockClear();
  });

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

    // Find the actual data write call
    const writeCall = mockRootSetSharedPluginData.mock.calls.find(
      (call) => call[1] === 'themes' && call[2] === compressedValue,
    );

    expect(writeCall).toBeTruthy();
    expect(writeCall).toEqual(['tokens', 'themes', compressedValue]);
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
