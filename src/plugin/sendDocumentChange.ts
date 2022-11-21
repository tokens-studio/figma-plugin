import { defaultNodeManager } from './NodeManager';
import { findAll } from '@/utils/findAll';

export async function sendDocumentChange(event: DocumentChangeEvent) {
  const allNodes = findAll([figma.root], false);
  const changeNodeIds = event.documentChanges.filter((change) => change.type === 'PROPERTY_CHANGE').map((change) => change.id);
  const nodes = allNodes.filter((node) => changeNodeIds.includes(node.id));
  await defaultNodeManager.update(nodes);
}
