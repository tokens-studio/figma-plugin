import { LDProps } from 'launchdarkly-react-client-sdk/lib/withLDConsumer';
import { UsedTokenSetsMap } from '@/types';
import { StorageType, StorageTypeCredentials } from '@/types/StorageType';
import isSameCredentials from '@/utils/isSameCredentials';
import { MessageFromPluginTypes } from '../types/messages';

type Options = {
  providers: StorageTypeCredentials[],
  storageType: StorageType,
  usedTokenSet?: UsedTokenSetsMap | null
  shouldPull?: boolean,
  featureFlags?: LDProps['flags'] | null
};

export default function compareProvidersWithStored({
  providers, storageType, usedTokenSet, shouldPull, featureFlags,
}: Options) {
  if (providers?.length) {
    const matchingSet = providers.find((i) => isSameCredentials(i, storageType));
    if (matchingSet) {
      // send a message to the UI with the credentials stored in the client
      figma.ui.postMessage({
        type: MessageFromPluginTypes.API_CREDENTIALS,
        status: true,
        credentials: matchingSet,
        usedTokenSet,
        shouldPull,
        featureFlags,
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
