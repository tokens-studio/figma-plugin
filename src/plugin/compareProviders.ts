import { UsedTokenSetsMap } from '@/types';
import { StorageType } from '@/types/api';
import isSameCredentials from '@/utils/isSameCredentials';
import { MessageFromPluginTypes } from '../types/messages';

type Options = {
  providers?: string | null,
  storageType: StorageType,
  featureFlagId?: string | null,
  usedTokenSet?: UsedTokenSetsMap | null,
  shouldPull?: boolean,
};

export default function compareProvidersWithStored({
  providers, storageType, featureFlagId, usedTokenSet, shouldPull
}: Options) {
  if (providers) {
    const parsedProviders = JSON.parse(providers) as any[]; // @TODO type properly
    const matchingSet = parsedProviders.find((i) => isSameCredentials(i, storageType));
    if (matchingSet) {
      // send a message to the UI with the credentials stored in the client
      figma.ui.postMessage({
        type: MessageFromPluginTypes.API_CREDENTIALS,
        status: true,
        credentials: matchingSet,
        featureFlagId,
        usedTokenSet,
        shouldPull
      });
      return;
    }
  }
  // send a message to the UI that says there are no credentials stored in the client
  figma.ui.postMessage({
    type: MessageFromPluginTypes.API_CREDENTIALS,
    status: false,
  });
}
