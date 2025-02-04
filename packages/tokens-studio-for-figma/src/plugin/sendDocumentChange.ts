import { sendSelectionChange } from './sendSelectionChange';
import { ValuesProperty } from '@/figmaStorage/ValuesProperty';
import { postToUI } from './notifiers';
import { MessageFromPluginTypes } from '@/types/messages';

export async function sendDocumentChange(event: DocumentChangeEvent) {
  const relevantChanges = event.documentChanges.filter((change) => change.type === 'PROPERTY_CHANGE' && change.properties?.includes('pluginData'));
  // console.log('relevantChanges', relevantChanges);

  if (relevantChanges.length > 0) {
    const sharedTokens = await ValuesProperty.read();
    console.log('sharedTokens', sharedTokens?.global);
    postToUI({
      type: MessageFromPluginTypes.SYNC_TOKENS,
      tokens: sharedTokens?.global,
    });
  }

  if (event.documentChanges.length === 1 && event.documentChanges[0].type === 'PROPERTY_CHANGE' && event.documentChanges[0].id === '0:0') {
    return;
  }
  await sendSelectionChange();
}
