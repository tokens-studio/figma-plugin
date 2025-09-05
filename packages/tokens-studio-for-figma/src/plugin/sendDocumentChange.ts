import { sendSelectionChange } from './sendSelectionChange';
import { notifyInstancesCreated } from './notifiers';

export async function sendDocumentChange(event: DocumentChangeEvent) {
  console.log('document change event', event);

  // Check if event has documentChanges before processing
  if (!event.documentChanges) {
    return;
  }

  if (event.documentChanges.length === 1 && event.documentChanges[0].type === 'PROPERTY_CHANGE' && event.documentChanges[0].id === '0:0') {
    return;
  }
  const changeNodeIds = event.documentChanges.filter((change) => change.origin === 'REMOTE' && change.type === 'PROPERTY_CHANGE').map((change) => change.id);
  if (!changeNodeIds.length) {
    return;
  }
  await sendSelectionChange();

  // Look for CREATE events of instance nodes and notify UI
  const instanceCreations = event.documentChanges.filter(
    (change) => change.type === 'CREATE' && change.origin === 'LOCAL',
  );

  if (instanceCreations.length > 0) {
    // Check if any of the created nodes are instance nodes
    const createdInstanceNodes = instanceCreations
      .map((change) => figma.getNodeById(change.id))
      .filter((node) => node && node.type === 'INSTANCE');

    if (createdInstanceNodes.length > 0) {
      // Set selection to the new instance nodes for potential token application
      figma.currentPage.selection = createdInstanceNodes as SceneNode[];

      // Notify UI that instances were created - UI will decide if it should apply tokens
      notifyInstancesCreated(createdInstanceNodes.length);
    }
  }
}
