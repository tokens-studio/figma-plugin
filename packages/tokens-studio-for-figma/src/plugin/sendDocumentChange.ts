import { sendSelectionChange } from './sendSelectionChange';
import { notifyInstancesCreated } from './notifiers';

// Whether any of the changed nodes is a selected node or sits inside one. Remote edits elsewhere in the
// file don't change what the UI shows for the selection, and every selection update is costly for the
// UI on large token sets, so those are skipped.
function changesTouchSelection(changedNodeIds: string[]) {
  const selectedIds = new Set(figma.currentPage.selection.map((node) => node.id));
  if (!selectedIds.size) return false;
  // A change event can list the same node several times
  return [...new Set(changedNodeIds)].some((id) => {
    let node: BaseNode | null = figma.getNodeById(id);
    while (node) {
      if (selectedIds.has(node.id)) return true;
      node = node.parent;
    }
    return false;
  });
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

  if (selfChangedNodeIds.length > 0 && changesTouchSelection(selfChangedNodeIds)) {
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
