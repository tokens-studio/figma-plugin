import { UpdateMode } from '@/constants/UpdateMode';
import { mockSetAsync, mockGetAsync, mockNotify } from '../../../tests/__mocks__/figmaMock';
import { getUISettings, updateUISettings } from '../uiSettings';
import { UiSettingsProperty } from '@/figmaStorage';

describe('uiSettings', () => {
  const uiSettingsReadSpy = jest.spyOn(UiSettingsProperty, 'read');
  const uiSettingsWriteSpy = jest.spyOn(UiSettingsProperty, 'write');

  it('can update the UI settings', async () => {
    await updateUISettings({
      width: 400,
      height: 400,
      showEmptyGroups: true,
      updateMode: UpdateMode.PAGE,
      updateRemote: true,
      updateOnChange: true,
      updateStyles: true,
      ignoreFirstPartForStyles: false,
      prefixStylesWithThemeName: false,
      inspectDeep: false,
      shouldSwapStyles: false,
      baseFontSize: '16',
      aliasBaseFontSize: '16',
    });
    expect(mockSetAsync).toBeCalledWith('uiSettings', JSON.stringify({
      width: 400,
      height: 400,
      showEmptyGroups: true,
      updateMode: UpdateMode.PAGE,
      updateRemote: true,
      updateOnChange: true,
      updateStyles: true,
      ignoreFirstPartForStyles: false,
      prefixStylesWithThemeName: false,
      inspectDeep: false,
      shouldSwapStyles: false,
      baseFontSize: '16',
      aliasBaseFontSize: '16',
    }));
  });

  it('can read the UI settings', async () => {
    mockGetAsync.mockImplementationOnce(() => Promise.resolve(JSON.stringify({
      width: 1000,
      height: 1000,
    })));
    expect(await getUISettings()).toEqual({
      width: 1000,
      height: 1000,
      showEmptyGroups: true,
      updateMode: UpdateMode.PAGE,
      updateRemote: true,
      updateOnChange: true,
      updateStyles: true,
      ignoreFirstPartForStyles: false,
      prefixStylesWithThemeName: false,
      inspectDeep: false,
      shouldSwapStyles: false,
      aliasBaseFontSize: '16',
      baseFontSize: '16',
    });
  });

  it('can read the UI settings from the plugin', async () => {
    mockGetAsync.mockImplementationOnce(() => Promise.resolve(JSON.stringify({
      width: 1000,
      height: 1000,
      showEmptyGroups: true,
      updateMode: UpdateMode.PAGE,
      updateRemote: true,
      updateOnChange: true,
      updateStyles: true,
      ignoreFirstPartForStyles: false,
      prefixStylesWithThemeName: false,
      inspectDeep: false,
      shouldSwapStyles: false,
      aliasBaseFontSize: '16',
      baseFontSize: '16',
    })));
    expect(await getUISettings()).toEqual({
      width: 1000,
      height: 1000,
      showEmptyGroups: true,
      updateMode: UpdateMode.PAGE,
      updateRemote: true,
      updateOnChange: true,
      updateStyles: true,
      ignoreFirstPartForStyles: false,
      prefixStylesWithThemeName: false,
      inspectDeep: false,
      shouldSwapStyles: false,
      aliasBaseFontSize: '16',
      baseFontSize: '16',
    });
  });

  it('should handle read errors', async () => {
    uiSettingsReadSpy.mockImplementationOnce(() => {
      throw new Error('error');
    });
    await getUISettings();
    expect(mockNotify).toBeCalledTimes(1);
    expect(mockNotify).toBeCalledWith('There was an issue saving your credentials. Please try again.', undefined);
  });

  it('should handle write errors', async () => {
    uiSettingsWriteSpy.mockImplementationOnce(() => {
      throw new Error('error');
    });
    await updateUISettings({});
    expect(mockNotify).toBeCalledTimes(1);
    expect(mockNotify).toBeCalledWith('There was an issue saving your credentials. Please try again.', undefined);
  });
});
