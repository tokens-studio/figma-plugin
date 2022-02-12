import { UpdateMode } from '@/types/state';
import { notifyUISettings, notifyUI, SavedSettings } from '@/plugin/notifiers';

// update credentials
export async function updateUISettings(uiSettings) {
  try {
    await figma.clientStorage.setAsync('uiSettings', JSON.stringify(uiSettings));
  } catch (err) {
    notifyUI('There was an issue saving your credentials. Please try again.');
  }
}

export async function getUISettings(): Promise<SavedSettings> {
  let settings: SavedSettings = {} as SavedSettings;
  try {
    const data = await figma.clientStorage.getAsync('uiSettings');

    let width;
    let height;
    let updateMode;
    let updateRemote;
    let updateOnChange;
    let updateStyles;
    let ignoreFirstPartForStyles;
    let inspectDeep;
    if (data) {
      const parsedData = await JSON.parse(data);
      width = parsedData.width || 400;
      height = parsedData.height || 600;
      updateMode = parsedData.updateMode || UpdateMode.PAGE;
      updateRemote = typeof parsedData.updateRemote === 'undefined' ? true : parsedData.updateRemote;
      updateOnChange = typeof parsedData.updateOnChange === 'undefined' ? true : parsedData.updateOnChange;
      updateStyles = typeof parsedData.updateStyles === 'undefined' ? true : parsedData.updateStyles;
      ignoreFirstPartForStyles = typeof parsedData.ignoreFirstPartForStyles === 'undefined'
        ? false
        : parsedData.ignoreFirstPartForStyles;
      inspectDeep = typeof parsedData.inspectDeep === 'undefined' ? false : parsedData.inspectDeep;
      settings = {
        width: Math.max(300, width),
        height: Math.max(200, height),
        updateMode,
        updateOnChange,
        updateRemote,
        updateStyles,
        ignoreFirstPartForStyles,
        inspectDeep,
      };
      notifyUISettings(settings);
    }
  } catch (err) {
    notifyUI('There was an issue saving your credentials. Please try again.');
  }
  return settings;
}
