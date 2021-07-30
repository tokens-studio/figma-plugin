import {notifyUISettings, notifyUI} from '@/plugin/notifiers';
import {UpdateMode} from 'Types/state';

// update credentials
export async function updateUISettings(uiSettings) {
    try {
        await figma.clientStorage.setAsync('uiSettings', JSON.stringify(uiSettings));
    } catch (err) {
        notifyUI('There was an issue saving your credentials. Please try again.');
    }
}

export async function getUISettings() {
    try {
        const data = await figma.clientStorage.getAsync('uiSettings');

        let width;
        let height;
        let updateMode;
        let updateRemote;
        let updateOnChange;
        let updateStyles;
        let ignoreFirstPartForStyles;
        if (data) {
            const parsedData = await JSON.parse(data);
            width = parsedData.width || 400;
            height = parsedData.height || 600;
            updateMode = parsedData.updateMode || UpdateMode.PAGE;
            updateRemote = parsedData.updateRemote || true;
            updateOnChange = parsedData.updateOnChange || true;
            updateStyles = parsedData.updateStyles || true;
            ignoreFirstPartForStyles = parsedData.ignoreFirstPartForStyles || true;
            notifyUISettings({
                width,
                height,
                updateMode,
                updateOnChange,
                updateRemote,
                updateStyles,
                ignoreFirstPartForStyles,
            });
        }
    } catch (err) {
        notifyUI('There was an issue saving your credentials. Please try again.');
    }
}
