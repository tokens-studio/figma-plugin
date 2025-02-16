import { sendSelectionChange } from './sendSelectionChange';
import { ValuesProperty } from '@/figmaStorage/ValuesProperty';
import { postToUI } from './notifiers';
import { MessageFromPluginTypes } from '@/types/messages';
import { ThemesProperty } from '@/figmaStorage/ThemesProperty';
import { TokenFormatProperty } from '@/figmaStorage/TokenFormatProperty';
import { ThemeObjectsList } from '@/types/ThemeObjectsList';
import { LastModifiedByProperty } from '@/figmaStorage/LastModifiedBy';

export async function sendDocumentChange(event: DocumentChangeEvent) {
  const relevantChanges = event.documentChanges.filter((change) => change.type === 'PROPERTY_CHANGE'
    && change.origin === 'REMOTE'
    && change.properties?.includes('pluginData'));

  const { currentUser } = figma;

  if (relevantChanges.length === 0) return;

  const sourceUserId = await LastModifiedByProperty.read();
  const targetUserId = currentUser?.id;

  // If the source is any other user, we need to sync tokens
  if (sourceUserId !== targetUserId) {
    const sharedTokens = await ValuesProperty.read();

    postToUI({
      type: MessageFromPluginTypes.SYNC_TOKENS,
      tokens: sharedTokens ?? {},
      values: await ValuesProperty.read() ?? { global: [] },
      themes: (await ThemesProperty.read() as ThemeObjectsList) ?? [],
      tokenFormat: await TokenFormatProperty.read() ?? 'json',
      isExternalChange: true,
    });
  }

  if (event.documentChanges.length === 1 && event.documentChanges[0].type === 'PROPERTY_CHANGE' && event.documentChanges[0].id === '0:0') {
    return;
  }

  await sendSelectionChange();
}
