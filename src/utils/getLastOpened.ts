export default async function getLastOpened(): Promise<Date> {
    let data;
    try {
        data = (await figma.clientStorage.getAsync('lastOpened')) || Date.now();
        figma.clientStorage.setAsync('lastOpened', Date.now());
    } catch (e) {
        console.error('error retrieving lastOpened', e);
        figma.clientStorage.setAsync('lastOpened', Date.now());
        data = Date.now();
    }
    return data;
}
