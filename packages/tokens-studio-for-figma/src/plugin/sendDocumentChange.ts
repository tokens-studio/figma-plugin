import { sendSelectionChange } from './sendSelectionChange';
import { notifyInstancesCreated } from './notifiers';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';
import { SharedPluginDataKeys } from '@/constants/SharedPluginDataKeys';
import { UpdatedAtProperty } from '@/figmaStorage';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

// Track the last known updatedAt timestamp to avoid duplicate notifications
let lastKnownUpdatedAt: string | null = null;

export async function sendDocumentChange(event: DocumentChangeEvent) {
  // Check if event has documentChanges before processing
  if (!event.documentChanges) {
    return;
  }

  if (event.documentChanges.length === 1 && event.documentChanges[0].type === 'PROPERTY_CHANGE' && event.documentChanges[0].id === '0:0') {
    return;
  }
  const selfChangedNodeIds = event.documentChanges.filter((change) => change.origin === 'REMOTE' && change.type === 'PROPERTY_CHANGE').map((change) => change.id);

  // Check for remote changes to token-related shared plugin data
  const tokenDataChanges = event.documentChanges.filter(
    (change) => change.type === 'PROPERTY_CHANGE'
      && change.origin === 'REMOTE'
      && change.id === '0:0' // Document root
      && change.properties?.some((prop) => {
        // Check if any of the changed properties are related to tokens
        const tokenKeys = Object.values(SharedPluginDataKeys[SharedPluginDataNamespaces.TOKENS]);
        return tokenKeys.some((key) => prop.includes(key));
      }),
  );

  // If token data changed from a remote user, notify the UI
  if (tokenDataChanges.length > 0) {
    try {
      // Read the current updatedAt timestamp
      const currentUpdatedAt = await UpdatedAtProperty.read(figma.root);
      
      // Only notify if the timestamp has actually changed
      if (currentUpdatedAt && currentUpdatedAt !== lastKnownUpdatedAt) {
        lastKnownUpdatedAt = currentUpdatedAt;
        
        // Notify the UI that token data has changed
        figma.ui.postMessage({
          type: AsyncMessageTypes.TOKEN_DATA_CHANGED,
          updatedAt: currentUpdatedAt,
        });
      }
    } catch (err) {
      console.error('Error detecting token data changes:', err);
    }
  }

  // Look for CREATE events of instance nodes and notify UI, so we can apply theme to inserted nodes
  const instanceCreations = event.documentChanges.filter(
    (change) => change.type === 'CREATE' && change.origin === 'LOCAL',
  );

  // Look for PROPERTY_CHANGE events on instance nodes where component properties changed
  const instanceVariantChanges = event.documentChanges.filter(
    (change) => change.type === 'PROPERTY_CHANGE'
      && change.origin === 'LOCAL'
      // @ts-ignore variant is a valid property, not sure why it complains
      && (change.properties.includes('componentProperties') || change.properties.includes('variant')),
  );

  if (selfChangedNodeIds.length > 0) {
    await sendSelectionChange();
  }

  if (instanceCreations.length > 0) {
    // Check if any of the created nodes are instance nodes
    const createdInstanceNodes = instanceCreations
      .map((change) => figma.getNodeById(change.id))
      .filter((node) => node && node.type === 'INSTANCE');

    if (createdInstanceNodes.length > 0) {
      // Notify UI that instances were created - UI will decide if it should apply tokens
      notifyInstancesCreated(createdInstanceNodes.length);
    }
  }

  if (instanceVariantChanges.length > 0) {
    // Check if any of the changed nodes are instance nodes
    const changedInstanceNodes = instanceVariantChanges
      .map((change) => figma.getNodeById(change.id))
      .filter((node) => node && node.type === 'INSTANCE');

    if (changedInstanceNodes.length > 0) {
      // Notify UI that instance variants were changed - UI will decide if it should apply tokens
      notifyInstancesCreated(changedInstanceNodes.length);
    }
  }
}
