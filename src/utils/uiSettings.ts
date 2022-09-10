import { UpdateMode } from '@/constants/UpdateMode';
import { UiSettingsProperty } from '@/figmaStorage';
import { notifyUISettings, notifyUI, SavedSettings } from '@/plugin/notifiers';

// update credentials
export async function updateUISettings(uiSettings: Partial<SavedSettings>) {
  try {
    const data = await UiSettingsProperty.read();
    await UiSettingsProperty.write({
      width: uiSettings.width ?? data?.width,
      height: uiSettings.height ?? data?.height,
      showEmptyGroups: uiSettings.showEmptyGroups ?? data?.showEmptyGroups,
      updateMode: uiSettings.updateMode ?? data?.updateMode,
      updateRemote: uiSettings.updateRemote ?? data?.updateRemote,
      updateOnChange: uiSettings.updateOnChange ?? data?.updateOnChange,
      updateStyles: uiSettings.updateStyles ?? data?.updateStyles,
      watchMode: uiSettings.watchMode ?? data?.watchMode,
      ignoreFirstPartForStyles: uiSettings.ignoreFirstPartForStyles ?? data?.ignoreFirstPartForStyles,
      prefixStylesWithThemeName: uiSettings.prefixStylesWithThemeName ?? data?.prefixStylesWithThemeName,
      inspectDeep: uiSettings.inspectDeep ?? data?.inspectDeep,
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
    let updateStyles: boolean;
    let watchMode: boolean;
    let ignoreFirstPartForStyles: boolean;
    let prefixStylesWithThemeName: boolean;
    let inspectDeep: boolean;
    if (data) {
      width = data.width || 400;
      height = data.height || 600;
      showEmptyGroups = typeof data.showEmptyGroups === 'undefined' ? true : data.showEmptyGroups;
      updateMode = data.updateMode || UpdateMode.PAGE;
      updateRemote = typeof data.updateRemote === 'undefined' ? true : data.updateRemote;
      updateOnChange = typeof data.updateOnChange === 'undefined' ? true : data.updateOnChange;
      updateStyles = typeof data.updateStyles === 'undefined' ? true : data.updateStyles;
      watchMode = typeof data.watchMode === 'undefined' ? true : data.watchMode;
      ignoreFirstPartForStyles = typeof data.ignoreFirstPartForStyles === 'undefined' ? false : data.ignoreFirstPartForStyles;
      prefixStylesWithThemeName = typeof data.prefixStylesWithThemeName === 'undefined' ? false : data.prefixStylesWithThemeName;
      inspectDeep = typeof data.inspectDeep === 'undefined' ? false : data.inspectDeep;
      settings = {
        width: Math.max(300, width),
        height: Math.max(200, height),
        showEmptyGroups,
        updateMode,
        updateOnChange,
        updateRemote,
        updateStyles,
        watchMode,
        ignoreFirstPartForStyles,
        prefixStylesWithThemeName,
        inspectDeep,
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
