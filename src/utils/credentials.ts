import {generateId} from '@/plugin/helpers';
import {notifyAPIProviders, notifyUI} from '@/plugin/notifiers';

// update credentials
export async function updateCredentials(context) {
    console.log('UPDATING CREDS', context);
    try {
        delete context.new;
        const data = await figma.clientStorage.getAsync('apiProviders');
        let existingProviders = [];
        if (data) {
            const parsedData = await JSON.parse(data);

            existingProviders = parsedData;

            const matchingProvider = existingProviders.findIndex((i) => i.internalId === context.internalId);
            if (typeof matchingProvider !== 'undefined') {
                console.log('Found a match, updating');
                existingProviders.splice(matchingProvider, 1, context);
            }

            if (!parsedData || typeof matchingProvider === 'undefined') {
                existingProviders.push({...context, internalId: generateId(24)});
            }
        } else {
            existingProviders.push({...context, internalId: generateId(24)});
        }
        console.log('New providers', existingProviders);
        await figma.clientStorage.setAsync('apiProviders', JSON.stringify(existingProviders));
        const newProviders = await figma.clientStorage.getAsync('apiProviders');
        notifyAPIProviders(JSON.parse(newProviders));
    } catch (err) {
        notifyUI('There was an issue saving your credentials. Please try again.');
    }
}

export async function removeSingleCredential({secret, id}) {
    try {
        const data = await figma.clientStorage.getAsync('apiProviders');
        let existingProviders = [];
        if (data) {
            const parsedData = await JSON.parse(data);

            existingProviders = parsedData
                .map((i) => {
                    return i.secret === secret && i.id === id ? null : i;
                })
                .filter((i) => i);
        }
        await figma.clientStorage.setAsync('apiProviders', JSON.stringify(existingProviders));
        const newProviders = await figma.clientStorage.getAsync('apiProviders');
        notifyAPIProviders(JSON.parse(newProviders));
    } catch (err) {
        notifyUI('There was an issue saving your credentials. Please try again.');
    }
}
