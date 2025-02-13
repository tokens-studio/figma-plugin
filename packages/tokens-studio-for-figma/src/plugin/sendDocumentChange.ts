import { sendSelectionChange } from './sendSelectionChange';
import { ValuesProperty } from '@/figmaStorage/ValuesProperty';
import { postToUI } from './notifiers';
import { MessageFromPluginTypes } from '@/types/messages';
import { CheckForChangesProperty } from '@/figmaStorage/CheckForChangesProperty';
import { ThemesProperty } from '@/figmaStorage/ThemesProperty';
import { TokenFormatProperty } from '@/figmaStorage/TokenFormatProperty';
import { ThemeObjectsList } from '@/types/ThemeObjectsList';
import { LastModifiedByProperty } from '@/figmaStorage/LastModifiedBy';
import { UpdatedAtProperty } from '@/figmaStorage/UpdatedAtProperty';

export async function sendDocumentChange(event: DocumentChangeEvent) {
  const relevantChanges = event.documentChanges.filter((change) => change.type === 'PROPERTY_CHANGE'
    && change.origin === 'REMOTE'
    && change.properties?.includes('pluginData'));

  console.log('updatedAT before return ', await UpdatedAtProperty.read());

  if (relevantChanges.length === 0) return;

  const { currentUser } = figma;

  const hasChanges = await CheckForChangesProperty.read();
  console.log('updatedAT ', await UpdatedAtProperty.read());

  const sourceUserId = await LastModifiedByProperty.read();
  const targetUserId = currentUser?.id;

  console.log('Change detection:', {
    sourceUserId,
    targetUserId,
    origin: event.documentChanges[0].origin,
    hasChanges,
    changes: relevantChanges.map((c) => ({
      type: c.type,
      ...(c.type === 'PROPERTY_CHANGE' ? { properties: c.properties } : {}),
    })),
  });

  if (hasChanges
    && relevantChanges.length > 2
    && event.documentChanges[0].origin === 'REMOTE'
    && event.documentChanges[0].type === 'PROPERTY_CHANGE'
    && event.documentChanges[0].properties?.includes('pluginData')) {
    console.log('Plugin data change detected:', {
      sourceUserId,
      targetUserId,
      properties: event.documentChanges[0].properties,
    });

    const sharedTokens = await ValuesProperty.read();

    await CheckForChangesProperty.write(null);

    postToUI({
      type: MessageFromPluginTypes.SYNC_TOKENS,
      tokens: sharedTokens ?? {},
      values: await ValuesProperty.read() ?? { global: [] },
      themes: (await ThemesProperty.read() as ThemeObjectsList) ?? [],
      tokenFormat: await TokenFormatProperty.read() ?? 'json',
    });

    return;
  }

  if (event.documentChanges.length === 1 && event.documentChanges[0].type === 'PROPERTY_CHANGE' && event.documentChanges[0].id === '0:0') {
    return;
  }

  await sendSelectionChange();
}
