import { UpdateMode } from '@/constants/UpdateMode';
import { mockSetAsync, mockGetAsync, mockNotify } from '../../../tests/__mocks__/figmaMock';
import { getUISettings, updateUISettings } from '../uiSettings';
import { UiSettingsProperty } from '@/figmaStorage';
import { TokenFormatOptions } from '@/plugin/TokenFormatStoreClass';
import { ApplyVariablesStylesOrRawValues } from '@/constants/ApplyVariablesStyleOrder';

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
      applyVariablesStylesOrRawValue: ApplyVariablesStylesOrRawValues.VARIABLES_STYLES,
      shouldUpdateStyles: true,
      ignoreFirstPartForStyles: false,
      createStylesWithVariableReferences: true,
      prefixStylesWithThemeName: false,
      renameExistingStylesAndVariables: false,
      removeStylesAndVariablesWithoutConnection: false,
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
      applyVariablesStylesOrRawValue: ApplyVariablesStylesOrRawValues.VARIABLES_STYLES,
      shouldUpdateStyles: true,
      ignoreFirstPartForStyles: false,
      createStylesWithVariableReferences: true,
      prefixStylesWithThemeName: false,
      renameExistingStylesAndVariables: false,
      removeStylesAndVariablesWithoutConnection: false,
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
      seenGenericVersionedHeaderMigrationDialog: undefined,
      seenTermsUpdate2026: undefined,
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
      applyVariablesStylesOrRawValue: ApplyVariablesStylesOrRawValues.VARIABLES_STYLES,
      shouldUpdateStyles: false,
      variablesColor: true,
      variablesNumber: true,
      variablesString: true,
      variablesBoolean: true,
      stylesEffect: true,
      stylesTypography: true,
      stylesColor: false,
      stylesGradient: false,
      createStylesWithVariableReferences: true,
      ignoreFirstPartForStyles: false,
      prefixStylesWithThemeName: false,
      renameExistingStylesAndVariables: false,
      removeStylesAndVariablesWithoutConnection: false,
      inspectDeep: false,
      sessionRecording: false,
      shouldSwapStyles: false,
      shouldSwapFigmaModes: false,
      storeTokenIdInJsonEditor: false,
      tokenFormat: TokenFormatOptions.DTCG,
      aliasBaseFontSize: '16',
      baseFontSize: '16',
      autoApplyThemeOnDrop: false,
      seenGenericVersionedHeaderMigrationDialog: false,
      seenTermsUpdate2026: false,
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
      applyVariablesStylesOrRawValue: ApplyVariablesStylesOrRawValues.VARIABLES_STYLES,
      shouldUpdateStyles: true,
      variablesColor: true,
      variablesNumber: true,
      variablesString: true,
      variablesBoolean: true,
      stylesEffect: true,
      stylesTypography: true,
      stylesColor: true,
      createStylesWithVariableReferences: true,
      ignoreFirstPartForStyles: false,
      prefixStylesWithThemeName: false,
      scopeVariablesByTokenType: false,
      renameExistingStylesAndVariables: false,
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
      applyVariablesStylesOrRawValue: ApplyVariablesStylesOrRawValues.VARIABLES_STYLES,
      shouldUpdateStyles: true,
      variablesColor: true,
      variablesNumber: true,
      variablesString: true,
      variablesBoolean: true,
      stylesEffect: true,
      stylesTypography: true,
      stylesColor: true,
      stylesGradient: false,
      createStylesWithVariableReferences: true,
      ignoreFirstPartForStyles: false,
      prefixStylesWithThemeName: false,
      renameExistingStylesAndVariables: false,
      removeStylesAndVariablesWithoutConnection: false,
      inspectDeep: false,
      sessionRecording: false,
      shouldSwapStyles: false,
      shouldSwapFigmaModes: false,
      storeTokenIdInJsonEditor: false,
      tokenFormat: TokenFormatOptions.Legacy,
      aliasBaseFontSize: '16',
      baseFontSize: '16',
      autoApplyThemeOnDrop: false,
      seenGenericVersionedHeaderMigrationDialog: false,
      seenTermsUpdate2026: false,
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
