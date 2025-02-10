import { sendSelectionChange } from './sendSelectionChange';
import { ValuesProperty } from '@/figmaStorage/ValuesProperty';
import { postToUI } from './notifiers';
import { MessageFromPluginTypes } from '@/types/messages';
import { CheckForChangesProperty } from '@/figmaStorage/CheckForChangesProperty';

export async function sendDocumentChange(event: DocumentChangeEvent) {
  const relevantChanges = event.documentChanges.filter((change) => change.type === 'PROPERTY_CHANGE'
    && change.origin === 'REMOTE'
    && change.properties?.includes('pluginData'));

  if (relevantChanges.length === 0) return;

  const hasChanges = await CheckForChangesProperty.read();

  if (hasChanges && event.documentChanges[0].origin === 'REMOTE') {
    const sharedTokens = await ValuesProperty.read();
    await CheckForChangesProperty.write(false);

    postToUI({
      type: MessageFromPluginTypes.SYNC_TOKENS,
      tokens: sharedTokens ?? {},
    });
  }

  if (event.documentChanges.length === 1 && event.documentChanges[0].type === 'PROPERTY_CHANGE' && event.documentChanges[0].id === '0:0') {
    return;
  }

  await sendSelectionChange();
}
