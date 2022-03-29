import isSameCredentials from '@/utils/isSameCredentials';
import { MessageFromPluginTypes } from '../types/messages';
import { notifyTokenValues } from './notifiers';

export default function compareProvidersWithStored(providers, storageType, featureFlagId?: string | null) {
  if (providers) {
    const parsedProviders = JSON.parse(providers);

    const matchingSet = parsedProviders.find((i) => isSameCredentials(i, storageType));
    if (matchingSet) {
      // send a message to the UI with the credentials stored in the client
      figma.ui.postMessage({
        type: MessageFromPluginTypes.API_CREDENTIALS,
        status: true,
        credentials: matchingSet,
        featureFlagId,
      });
      return;
    }
  }
  // send a message to the UI that says there are no credentials stored in the client
  figma.ui.postMessage({
    type: MessageFromPluginTypes.API_CREDENTIALS,
    status: false,
  });
  // Read no values from storage
  notifyTokenValues();
}
