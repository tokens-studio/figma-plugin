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

  it('should be able to write', async () => {
    await ThemesProperty.write(mockThemes);
    expect(mockRootSetSharedPluginData).toBeCalledTimes(1);
    expect(mockRootSetSharedPluginData).toBeCalledWith('tokens', 'themes', JSON.stringify(mockThemes));
  });

  it('should be able to read', async () => {
    mockRootGetSharedPluginData.mockReturnValueOnce(JSON.stringify(mockThemes));
    expect(await ThemesProperty.read()).toEqual(mockThemes);
  });
});
