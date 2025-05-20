import { ApplyVariablesStylesOrRawValues } from '@/constants/ApplyVariablesStyleOrder';
import { defaultBaseFontSize } from '../constants/defaultBaseFontSize';
import { UpdateMode } from '@/constants/UpdateMode';
import { UiSettingsProperty } from '@/figmaStorage';
import { TokenFormatOptions } from '@/plugin/TokenFormatStoreClass';
import { notifyUISettings, notifyUI, SavedSettings } from '@/plugin/notifiers';

// update credentials
export async function updateUISettings(uiSettings: Partial<SavedSettings>) {
  try {
    const data = await UiSettingsProperty.read();
    await UiSettingsProperty.write({
      sessionRecording: uiSettings.sessionRecording ?? data?.sessionRecording,
      width: uiSettings.width ?? data?.width,
      language: uiSettings.language ?? data?.language,
      height: uiSettings.height ?? data?.height,
      showEmptyGroups: uiSettings.showEmptyGroups ?? data?.showEmptyGroups,
      updateMode: uiSettings.updateMode ?? data?.updateMode,
      updateRemote: uiSettings.updateRemote ?? data?.updateRemote,
      updateOnChange: uiSettings.updateOnChange ?? data?.updateOnChange,
      applyVariablesStylesOrRawValue: uiSettings.applyVariablesStylesOrRawValue ?? data?.applyVariablesStylesOrRawValue,
      shouldUpdateStyles: uiSettings.shouldUpdateStyles ?? data?.shouldUpdateStyles,
      ignoreFirstPartForStyles: uiSettings.ignoreFirstPartForStyles ?? data?.ignoreFirstPartForStyles,
      createStylesWithVariableReferences:
        uiSettings.createStylesWithVariableReferences ?? data?.createStylesWithVariableReferences,
      prefixStylesWithThemeName: uiSettings.prefixStylesWithThemeName ?? data?.prefixStylesWithThemeName,
      renameExistingStylesAndVariables:
        uiSettings.renameExistingStylesAndVariables ?? data?.renameExistingStylesAndVariables,
      removeStylesAndVariablesWithoutConnection:
        uiSettings.removeStylesAndVariablesWithoutConnection ?? data?.removeStylesAndVariablesWithoutConnection,
      variablesBoolean: uiSettings.variablesBoolean ?? data?.variablesBoolean,
      variablesColor: uiSettings.variablesColor ?? data?.variablesColor,
      variablesNumber: uiSettings.variablesNumber ?? data?.variablesNumber,
      variablesString: uiSettings.variablesString ?? data?.variablesString,
      stylesColor: uiSettings.stylesColor ?? data?.stylesColor,
      stylesEffect: uiSettings.stylesEffect ?? data?.stylesEffect,
      stylesTypography: uiSettings.stylesTypography ?? data?.stylesTypography,
      inspectDeep: uiSettings.inspectDeep ?? data?.inspectDeep,
      shouldSwapStyles: uiSettings.shouldSwapStyles ?? data?.shouldSwapStyles,
      baseFontSize: uiSettings.baseFontSize ?? data?.baseFontSize,
      aliasBaseFontSize: uiSettings.aliasBaseFontSize ?? data?.aliasBaseFontSize,
      storeTokenIdInJsonEditor: uiSettings.storeTokenIdInJsonEditor ?? data?.storeTokenIdInJsonEditor,
      tokenFormat: uiSettings.tokenFormat ?? data?.tokenFormat,
    });
  } catch (err) {
    notifyUI('There was an issue saving your credentials. Please try again.');
  }
}

export async function getUISettings(notify = true): Promise<SavedSettings> {
  let settings: SavedSettings = {} as SavedSettings;
  try {
    const data = await UiSettingsProperty.read();

    let width: number;
    let height: number;
    let showEmptyGroups: boolean;
    let updateMode: UpdateMode;
    let updateRemote: boolean;
    let updateOnChange: boolean;
    let applyVariablesStylesOrRawValue: ApplyVariablesStylesOrRawValues;
    let shouldUpdateStyles: boolean;
    let variablesColor: boolean;
    let variablesBoolean: boolean;
    let variablesNumber: boolean;
    let variablesString: boolean;
    let stylesColor: boolean;
    let stylesEffect: boolean;
    let stylesTypography: boolean;
    let ignoreFirstPartForStyles: boolean;
    let createStylesWithVariableReferences: boolean;
    let prefixStylesWithThemeName: boolean;
    let renameExistingStylesAndVariables: boolean;
    let removeStylesAndVariablesWithoutConnection: boolean;
    let inspectDeep: boolean;
    let shouldSwapStyles: boolean;
    let baseFontSize: string;
    let aliasBaseFontSize: string;
    let language: string;
    let sessionRecording: boolean;
    let storeTokenIdInJsonEditor: boolean;
    let tokenFormat: TokenFormatOptions;

    if (data) {
      width = data.width || 400;
      height = data.height || 600;
      language = data.language || 'en';
      showEmptyGroups = typeof data.showEmptyGroups === 'undefined' ? true : data.showEmptyGroups;
      updateMode = data.updateMode || UpdateMode.PAGE;
      updateRemote = typeof data.updateRemote === 'undefined' ? true : data.updateRemote;
      updateOnChange = typeof data.updateOnChange === 'undefined' ? true : data.updateOnChange;
      applyVariablesStylesOrRawValue =
        typeof data.applyVariablesStylesOrRawValue === 'undefined'
          ? ApplyVariablesStylesOrRawValues.VARIABLES_STYLES
          : data.applyVariablesStylesOrRawValue;
      shouldUpdateStyles = typeof data.shouldUpdateStyles === 'undefined' ? false : data.shouldUpdateStyles;
      variablesColor = typeof data.variablesColor === 'undefined' ? true : data.variablesColor;
      variablesBoolean = typeof data.variablesBoolean === 'undefined' ? true : data.variablesBoolean;
      variablesNumber = typeof data.variablesNumber === 'undefined' ? true : data.variablesNumber;
      variablesString = typeof data.variablesString === 'undefined' ? true : data.variablesString;
      stylesColor = typeof data.stylesColor === 'undefined' ? false : data.stylesColor;
      stylesTypography = typeof data.stylesTypography === 'undefined' ? true : data.stylesTypography;
      stylesEffect = typeof data.stylesEffect === 'undefined' ? true : data.stylesEffect;
      ignoreFirstPartForStyles =
        typeof data.ignoreFirstPartForStyles === 'undefined' ? false : data.ignoreFirstPartForStyles;
      createStylesWithVariableReferences =
        typeof data.createStylesWithVariableReferences === 'undefined' ? true : data.createStylesWithVariableReferences;
      prefixStylesWithThemeName =
        typeof data.prefixStylesWithThemeName === 'undefined' ? false : data.prefixStylesWithThemeName;
      renameExistingStylesAndVariables =
        typeof data.renameExistingStylesAndVariables === 'undefined' ? false : data.renameExistingStylesAndVariables;
      removeStylesAndVariablesWithoutConnection =
        typeof data.removeStylesAndVariablesWithoutConnection === 'undefined'
          ? false
          : data.removeStylesAndVariablesWithoutConnection;
      baseFontSize = typeof data.baseFontSize === 'undefined' ? defaultBaseFontSize : data.baseFontSize;
      aliasBaseFontSize = typeof data.aliasBaseFontSize === 'undefined' ? defaultBaseFontSize : data.aliasBaseFontSize;
      inspectDeep = typeof data.inspectDeep === 'undefined' ? false : data.inspectDeep;
      shouldSwapStyles = typeof data.shouldSwapStyles === 'undefined' ? false : data.shouldSwapStyles;
      sessionRecording = typeof data.sessionRecording === 'undefined' ? false : data.sessionRecording;
      storeTokenIdInJsonEditor =
        typeof data.storeTokenIdInJsonEditor === 'undefined' ? false : data.storeTokenIdInJsonEditor;
      tokenFormat = data.tokenFormat || TokenFormatOptions.Legacy;
      settings = {
        language,
        width: Math.max(300, width),
        height: Math.max(200, height),
        sessionRecording,
        showEmptyGroups,
        updateMode,
        updateOnChange,
        applyVariablesStylesOrRawValue,
        updateRemote,
        shouldUpdateStyles,
        variablesBoolean,
        variablesColor,
        variablesNumber,
        variablesString,
        stylesColor,
        stylesEffect,
        stylesTypography,
        ignoreFirstPartForStyles,
        createStylesWithVariableReferences,
        prefixStylesWithThemeName,
        renameExistingStylesAndVariables,
        removeStylesAndVariablesWithoutConnection,
        inspectDeep,
        shouldSwapStyles,
        baseFontSize,
        aliasBaseFontSize,
        storeTokenIdInJsonEditor,
        tokenFormat,
      };

      if (notify) {
        notifyUISettings(settings);
      }
    }
  } catch (err) {
    console.error(err);
    notifyUI('There was an issue saving your credentials. Please try again.');
  }
  return settings;
}
