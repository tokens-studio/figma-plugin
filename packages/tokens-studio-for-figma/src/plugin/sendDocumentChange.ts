import { sendSelectionChange } from './sendSelectionChange';
import { notifyInstancesCreated } from './notifiers';

function handleInstanceEvents(filteredChanges: DocumentChange[]) {
  if (filteredChanges.length > 0) {
    // Check if any of the nodes are instance nodes
    const instanceNodes = filteredChanges
      .map((change) => figma.getNodeById(change.id))
      .filter((node) => node && node.type === 'INSTANCE');

    if (instanceNodes.length > 0) {
      // Notify UI that instances were affected - UI will decide if it should apply tokens
      notifyInstancesCreated(instanceNodes.length);
    }
  }
}

export async function sendDocumentChange(event: DocumentChangeEvent) {
  // Check if event has documentChanges before processing
  if (!event.documentChanges) {
    return;
  }

  if (event.documentChanges.length === 1 && event.documentChanges[0].type === 'PROPERTY_CHANGE' && event.documentChanges[0].id === '0:0') {
    return;
  }
  const selfChangedNodeIds = event.documentChanges.filter((change) => change.origin === 'REMOTE' && change.type === 'PROPERTY_CHANGE').map((change) => change.id);

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

  // Handle both instance creation and variant changes using the same logic
  handleInstanceEvents(instanceCreations);
  handleInstanceEvents(instanceVariantChanges);
}
