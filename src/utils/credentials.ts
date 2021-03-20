import {notifyAPIProviders, notifyUI} from '@/plugin/notifiers';

// update credentials
export async function updateCredentials({secret, id, name, provider}) {
    try {
        const data = await figma.clientStorage.getAsync('apiProviders');
        let existingProviders = [];
        if (data) {
            const parsedData = await JSON.parse(data);

            existingProviders = parsedData;

            const matchingProvider = existingProviders.find(
                (i) => i.secret === secret && i.id === id && i.provider === provider
            );

            if (matchingProvider) {
                matchingProvider.name = name;
            }

            if (!parsedData || !matchingProvider) {
                existingProviders.push({id, secret, name, provider});
            }
        } else {
            existingProviders.push({id, secret, name, provider});
        }
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
