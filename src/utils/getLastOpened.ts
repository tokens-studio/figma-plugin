export default async function getLastOpened(): Promise<Date> {
    let data;
    try {
        // Set specific date as lastOpened if none existed (when we started the changelog)
        data = (await figma.clientStorage.getAsync('lastOpened')) || 1616241985291;
        figma.clientStorage.setAsync('lastOpened', Date.now());
    } catch (e) {
        console.error('error retrieving lastOpened', e);
        figma.clientStorage.setAsync('lastOpened', Date.now());
        data = 1616241985291;
    }
    return data;
}
