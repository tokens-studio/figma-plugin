import {MessageFromPluginTypes} from '../../types/messages';
import {notifyTokenValues} from './notifiers';

export default function compareProvidersWithStored(providers, storageType) {
    if (providers) {
        const parsedProviders = JSON.parse(providers);
        const matchingSet = parsedProviders.find((i) => i.provider === storageType.provider && i.id === storageType.id);
        if (matchingSet) {
            // send a message to the UI with the credentials stored in the client
            figma.ui.postMessage({
                type: MessageFromPluginTypes.API_CREDENTIALS,
                status: true,
                credentials: matchingSet,
            });
        }
    } else {
        // send a message to the UI that says there are no credentials stored in the client
        figma.ui.postMessage({
            type: MessageFromPluginTypes.API_CREDENTIALS,
            status: false,
        });
        // Read no values from storage
        notifyTokenValues();
    }
}
