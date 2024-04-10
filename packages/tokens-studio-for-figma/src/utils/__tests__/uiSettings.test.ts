import { UpdateMode } from '@/constants/UpdateMode';
import { mockSetAsync, mockGetAsync, mockNotify } from '../../../tests/__mocks__/figmaMock';
import { getUISettings, updateUISettings } from '../uiSettings';
import { UiSettingsProperty } from '@/figmaStorage';
import { TokenFormatOptions } from '@/plugin/TokenFormatStoreClass';
import { overwriteExistingStylesAndVariablesSelector, scopeVariablesByTokenTypeSelector } from '@/selectors';

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
      createStylesWithVariableReferences: false,
      prefixStylesWithThemeName: false,
      scopeVariablesByTokenType: false,
      overwriteExistingStylesAndVariables: false,
      variablesBoolean: false,
      variablesColor: false,
      variablesNumber: false,
      variablesString: false,
      stylesColor: false,
      stylesEffect: false,
      stylesTypography: false,
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
      createStylesWithVariableReferences: false,
      prefixStylesWithThemeName: false,
      overwriteExistingStylesAndVariables: false,
      scopeVariablesByTokenType: false,
      variablesBoolean: false,
      variablesColor: false,
      variablesNumber: false,
      variablesString: false,
      stylesColor: false,
      stylesEffect: false,
      stylesTypography: false,
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
      language: 'en',
      showEmptyGroups: true,
      updateMode: UpdateMode.PAGE,
      updateRemote: true,
      updateOnChange: true,
      updateStyles: true,
      variablesColor: true,
      variablesNumber: true,
      variablesString: true,
      variablesBoolean: true,
      stylesEffect: true,
      stylesTypography: true,
      stylesColor: true,
      createStylesWithVariableReferences: false,
      ignoreFirstPartForStyles: false,
      prefixStylesWithThemeName: false,
      scopeVariablesByTokenType: false,
      overwriteExistingStylesAndVariables: false,
      inspectDeep: false,
      sessionRecording: false,
      shouldSwapStyles: false,
      storeTokenIdInJsonEditor: false,
      tokenFormat: TokenFormatOptions.Legacy,
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
      variablesColor: true,
      variablesNumber: true,
      variablesString: true,
      variablesBoolean: true,
      stylesEffect: true,
      stylesTypography: true,
      stylesColor: true,
      createStylesWithVariableReferences: false,
      ignoreFirstPartForStyles: false,
      prefixStylesWithThemeName: false,
      scopeVariablesByTokenType: false,
      overwriteExistingStylesAndVariables: false,
      inspectDeep: false,
      shouldSwapStyles: false,
      storeTokenIdInJsonEditor: false,
      tokenFormat: TokenFormatOptions.Legacy,
      aliasBaseFontSize: '16',
      baseFontSize: '16',
    })));
    expect(await getUISettings()).toEqual({
      width: 1000,
      height: 1000,
      language: 'en',
      showEmptyGroups: true,
      updateMode: UpdateMode.PAGE,
      updateRemote: true,
      updateOnChange: true,
      updateStyles: true,
      variablesColor: true,
      variablesNumber: true,
      variablesString: true,
      variablesBoolean: true,
      stylesEffect: true,
      stylesTypography: true,
      stylesColor: true,
      createStylesWithVariableReferences: false,
      ignoreFirstPartForStyles: false,
      prefixStylesWithThemeName: false,
      scopeVariablesByTokenType: false,
      overwriteExistingStylesAndVariables: false,
      inspectDeep: false,
      sessionRecording: false,
      shouldSwapStyles: false,
      storeTokenIdInJsonEditor: false,
      tokenFormat: TokenFormatOptions.Legacy,
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
