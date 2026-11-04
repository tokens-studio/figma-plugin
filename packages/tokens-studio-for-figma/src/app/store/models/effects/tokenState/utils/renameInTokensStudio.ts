import type { RematchDispatch } from '@rematch/core';
import type { RootModel } from '@/types/RootModel';
import type { ThemeObjectsList } from '@/types';
import { pushToTokensStudioOAuth } from '../../../../providers/tokens-studio/tokensStudioOAuth';
import { store } from '@/app/store';
import {
  lookupBySanitized, resolveSanitizedKey, sanitizeTokenSetName, toStudioThemeGroupName,
} from './sanitizeForStudio';

type SetEntry = { id?: string; isDynamic?: boolean };

// The Studio id of a set: tokenSetMetadata has the sets created since the last pull, remoteData the rest.
function findStudioSet(name: string): SetEntry | undefined {
  const { tokenSetMetadata, remoteData } = store.getState().tokenState;
  const sanitized = sanitizeTokenSetName(name);
  const local = lookupBySanitized(tokenSetMetadata as Record<string, SetEntry>, sanitized, sanitizeTokenSetName);
  if (local?.id) return local;
  return lookupBySanitized(remoteData?.metadata?.tokenSetsData as Record<string, SetEntry> | undefined, sanitized, sanitizeTokenSetName);
}

// A renamed collection or mode reaches the plugin as a renamed set ("Brand/Dark" → "Brand/Night"). Rename the
// set in Tokens Studio instead of letting the import create a second one next to it.
// Returns whether it was renamed there.
async function renameTokenSet(context: any, oldName: string, newName: string, dispatch: RematchDispatch<RootModel>): Promise<boolean> {
  const oldSet = findStudioSet(oldName);
  // Nothing to rename, or the new name is taken already: let the import create or reuse that set.
  if (!oldSet?.id || findStudioSet(newName)?.id) return false;

  const result = await pushToTokensStudioOAuth({
    context,
    action: 'UPDATE_TOKEN_SET',
    data: { id: oldSet.id, name: sanitizeTokenSetName(newName) },
  });
  if (!result) return false;

  const metadata = { ...store.getState().tokenState.tokenSetMetadata } as Record<string, SetEntry>;
  const oldKey = resolveSanitizedKey(metadata, sanitizeTokenSetName(oldName), sanitizeTokenSetName);
  // Keep whatever else the set's entry holds, such as fromVariableImport.
  const oldEntry = oldKey === undefined ? undefined : metadata[oldKey];
  if (oldKey !== undefined) delete metadata[oldKey];
  dispatch.tokenState.setTokenSetMetadata({
    ...metadata,
    [newName]: { ...oldEntry, id: oldSet.id, isDynamic: oldSet.isDynamic ?? false },
  } as any);
  return true;
}

// Returns the renames that were applied in Tokens Studio.
export async function renameTokenSetsInTokensStudio(
  context: any,
  renamedCollections: [string, string][],
  dispatch: RematchDispatch<RootModel>,
): Promise<[string, string][]> {
  const renamed: [string, string][] = [];
  for (const [oldName, newName] of renamedCollections) {
    // eslint-disable-next-line no-await-in-loop
    if (await renameTokenSet(context, oldName, newName, dispatch)) renamed.push([oldName, newName]);
  }
  return renamed;
}

async function renameThemeGroup(context: any, oldName: string, newName: string, dispatch: RematchDispatch<RootModel>): Promise<void> {
  const { metadata } = store.getState().tokenState.remoteData || {};
  const groups = (metadata?.themeGroupsData || {}) as Record<string, { id: string }>;
  const oldGroup = lookupBySanitized(groups, oldName, toStudioThemeGroupName);
  if (!oldGroup?.id || lookupBySanitized(groups, newName, toStudioThemeGroupName)?.id) return;

  const result = await pushToTokensStudioOAuth({
    context,
    action: 'UPDATE_THEME_GROUP',
    data: { id: oldGroup.id, name: newName },
  });
  if (!result) return;

  const remainingGroups = { ...groups };
  delete remainingGroups[resolveSanitizedKey(remainingGroups, oldName, toStudioThemeGroupName) ?? oldName];
  dispatch.tokenState.setRemoteMetadata({ ...metadata, themeGroupsData: { ...remainingGroups, [newName]: { id: oldGroup.id } } });
}

// A renamed collection moves its themes to a group with the new name. Rename the group in Tokens Studio, so
// the theme updates that follow find it, instead of creating a new group and leaving the old one empty.
export async function renameThemeGroupsInTokensStudio(
  context: any,
  previousThemes: ThemeObjectsList | undefined,
  updatedThemes: ThemeObjectsList | undefined,
  dispatch: RematchDispatch<RootModel>,
): Promise<void> {
  const previousById = new Map((previousThemes || []).map((theme) => [theme.id, theme]));
  const renames = new Map<string, string>();
  (updatedThemes || []).forEach((theme) => {
    const previous = previousById.get(theme.id);
    if (!previous?.group || !theme.group) return;
    const oldName = toStudioThemeGroupName(previous.group);
    const newName = toStudioThemeGroupName(theme.group);
    if (oldName && newName && oldName !== newName) renames.set(oldName, newName);
  });

  for (const [oldName, newName] of renames) {
    // eslint-disable-next-line no-await-in-loop
    await renameThemeGroup(context, oldName, newName, dispatch);
  }
}
