import {ContextObject} from '@/types/api';
import {generateId} from '@/plugin/helpers';
import {notifyAPIProviders, notifyUI} from '@/plugin/notifiers';
import isSameCredentials from './isSameCredentials';

// update credentials
export async function updateCredentials(context: ContextObject) {
    try {
        delete context.new;
        const data = await figma.clientStorage.getAsync('apiProviders');
        let existingProviders = [];
        if (data) {
            const parsedData = await JSON.parse(data);

            existingProviders = parsedData;

            let matchingProvider;
            if (context.internalId) {
                matchingProvider = existingProviders.findIndex((i) => i.internalId === context.internalId);
            } else {
                matchingProvider = existingProviders.findIndex((i) => isSameCredentials(i, context));
            }
            // Handle case for old credentials where  we had no internalId. Check id and secret and provider then
            if (matchingProvider !== -1) {
                existingProviders.splice(matchingProvider, 1, context);
            }

            if (!parsedData || matchingProvider === -1) {
                existingProviders.push({...context, internalId: generateId(24)});
            }
        } else {
            existingProviders.push({...context, internalId: generateId(24)});
        }
        await figma.clientStorage.setAsync('apiProviders', JSON.stringify(existingProviders));
        const newProviders = await figma.clientStorage.getAsync('apiProviders');
        notifyAPIProviders(JSON.parse(newProviders));
    } catch (err) {
        notifyUI('There was an issue saving your credentials. Please try again.');
    }
}

export async function removeSingleCredential(context: ContextObject) {
    try {
        const data = await figma.clientStorage.getAsync('apiProviders');
        let existingProviders = [];
        if (data) {
            const parsedData = await JSON.parse(data);

            existingProviders = parsedData.map((i) => (isSameCredentials(i, context) ? null : i)).filter((i) => i);
        }
        await figma.clientStorage.setAsync('apiProviders', JSON.stringify(existingProviders));
        const newProviders = await figma.clientStorage.getAsync('apiProviders');
        notifyAPIProviders(JSON.parse(newProviders));
    } catch (err) {
        notifyUI('There was an issue saving your credentials. Please try again.');
    }
}
