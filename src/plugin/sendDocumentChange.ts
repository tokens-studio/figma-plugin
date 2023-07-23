import compact from 'just-compact';
import { defaultNodeManager } from './NodeManager';
import { sendSelectionChange } from './sendSelectionChange';

export async function sendDocumentChange(event: DocumentChangeEvent) {
  console.log('sendDocumentChange', event);

  const changeNodeIds = event.documentChanges.filter((change) => change.origin === 'REMOTE' && change.type === 'PROPERTY_CHANGE').map((change) => change.id);
  if (!changeNodeIds.length) {
    return;
  }
  const nodeManagers = await Promise.all(changeNodeIds.map((nodeId) => defaultNodeManager.getNode(nodeId)));
  const nodes = compact(nodeManagers).map((nodeManager) => nodeManager?.node);
  await defaultNodeManager.update(nodes);
  await sendSelectionChange();
}
