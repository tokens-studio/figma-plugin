import { sendSelectionChange } from './sendSelectionChange';

export async function sendDocumentChange(event: DocumentChangeEvent) {
  console.log('document change event', event);
  if (event.documentChanges.length === 1 && event.documentChanges[0].type === 'PROPERTY_CHANGE' && event.documentChanges[0].id === '0:0') {
    return;
  }
  const changeNodeIds = event.documentChanges.filter((change) => change.origin === 'REMOTE' && change.type === 'PROPERTY_CHANGE').map((change) => change.id);
  if (!changeNodeIds.length) {
    return;
  }
  await sendSelectionChange();
}
