import {notifyUISettings, notifyUI} from '@/plugin/notifiers';

// update credentials
export async function updateUISettings({width, height}) {
    try {
        await figma.clientStorage.setAsync('uiSettings', JSON.stringify({width, height}));
    } catch (err) {
        notifyUI('There was an issue saving your credentials. Please try again.');
    }
}

export async function getUISettings() {
    try {
        const data = await figma.clientStorage.getAsync('uiSettings');

        let width;
        let height;
        if (data) {
            const parsedData = await JSON.parse(data);
            width = parsedData.width || 400;
            height = parsedData.height || 600;
            notifyUISettings({width, height});
        }
    } catch (err) {
        notifyUI('There was an issue saving your credentials. Please try again.');
    }
}
