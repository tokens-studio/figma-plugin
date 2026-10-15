/* eslint-disable no-continue */
import type { RematchDispatch } from '@rematch/core';
import type { RootModel } from '@/types/RootModel';
import type { ThemeObjectsList } from '@/types';
import { pushToTokensStudioOAuth } from '../../../../providers/tokens-studio/tokensStudioOAuth';
import { store } from '@/app/store';
import {
  lookupBySanitized, resolveSanitizedKey, sanitizeTokenName, sanitizeTokenSetName, toStudioThemeGroupName,
} from './sanitizeForStudio';
import type { TokenRename } from './findRenamedVariableTokens';

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
// Returns the renames that were applied there.
export async function renameTokenSetsInTokensStudio(
  context: any,
  renamedCollections: [string, string][],
  dispatch: RematchDispatch<RootModel>,
): Promise<[string, string][]> {
  const renamed: [string, string][] = [];
  for (const [oldName, newName] of renamedCollections) {
    const oldSet = findStudioSet(oldName);
    // Nothing to rename, or the new name is taken already: let the import create or reuse that set.
    if (!oldSet?.id || findStudioSet(newName)?.id) continue;

    // eslint-disable-next-line no-await-in-loop
    const result = await pushToTokensStudioOAuth({
      context,
      action: 'UPDATE_TOKEN_SET',
      data: { id: oldSet.id, name: sanitizeTokenSetName(newName) },
    });
    if (!result) continue;

    const metadata = { ...store.getState().tokenState.tokenSetMetadata } as Record<string, SetEntry>;
    delete metadata[resolveSanitizedKey(metadata, sanitizeTokenSetName(oldName), sanitizeTokenSetName) ?? oldName];
    dispatch.tokenState.setTokenSetMetadata({ ...metadata, [newName]: { id: oldSet.id, isDynamic: oldSet.isDynamic ?? false } } as any);
    renamed.push([oldName, newName]);
  }
  return renamed;
}

// A renamed collection moves its themes to a group with the new name. Rename the group in Tokens Studio, so
// the theme updates that follow find it, instead of creating a new group and leaving the old one empty.
export async function renameThemeGroupsInTokensStudio(
  context: any,
  previousThemes: ThemeObjectsList | undefined,
  updatedThemes: ThemeObjectsList | undefined,
  dispatch: RematchDispatch<RootModel>,
): Promise<void> {
  const renames = new Map<string, string>();
  (updatedThemes || []).forEach((theme) => {
    const previous = (previousThemes || []).find((t) => t.id === theme.id);
    if (!previous?.group || !theme.group) return;
    const oldName = toStudioThemeGroupName(previous.group);
    const newName = toStudioThemeGroupName(theme.group);
    if (oldName && newName && oldName !== newName) renames.set(oldName, newName);
  });

  for (const [oldName, newName] of renames) {
    const { metadata } = store.getState().tokenState.remoteData || {};
    const groups = (metadata?.themeGroupsData || {}) as Record<string, { id: string }>;
    const oldGroup = lookupBySanitized(groups, oldName, toStudioThemeGroupName);
    if (!oldGroup?.id || lookupBySanitized(groups, newName, toStudioThemeGroupName)?.id) continue;

    // eslint-disable-next-line no-await-in-loop
    const result = await pushToTokensStudioOAuth({
      context,
      action: 'UPDATE_THEME_GROUP',
      data: { id: oldGroup.id, name: newName },
    });
    if (!result) continue;

    const remainingGroups = { ...groups };
    delete remainingGroups[resolveSanitizedKey(remainingGroups, oldName, toStudioThemeGroupName) ?? oldName];
    dispatch.tokenState.setRemoteMetadata({ ...metadata, themeGroupsData: { ...remainingGroups, [newName]: { id: oldGroup.id } } });
  }
}

export const renamedTokenKey = (set: string, name: string) => `${set}\u0000${name}`;

type ImportedToken = { name: string; value: unknown; parent?: string };

// Renamed variables and changed values, sent as updates to the existing tokens. Returns the renamed tokens'
// new names per set, so the import doesn't also create them.
export async function updateTokensInTokensStudio(
  context: any,
  {
    renames, updatedTokens, newTokens, previousTokens, renamedSets,
  }: {
    renames: TokenRename[];
    updatedTokens: ImportedToken[];
    newTokens: ImportedToken[];
    previousTokens: Record<string, Array<{ name: string; $extensions?: { id?: string } }>> | undefined;
    renamedSets: [string, string][];
  },
): Promise<Set<string>> {
  const renamedTokens = new Set<string>();
  if (renames.length === 0 && updatedTokens.length === 0) return renamedTokens;

  // The set a token was in before this import: a renamed set still has its old name in previousTokens.
  const previousSetName = (set: string) => renamedSets.find(([, newName]) => newName === set)?.[0] ?? set;

  let studioTokens: Array<{ id: string; name: string; token_set_id: string }> | null = null;
  const findTokenId = async (set: string, name: string): Promise<string | undefined> => {
    const local = (previousTokens?.[previousSetName(set)] || []).find((token) => token.name === name);
    if (local?.$extensions?.id) return local.$extensions.id;
    // Tokens this plugin created through an import don't have their Studio id locally; look it up.
    if (!studioTokens) studioTokens = (await pushToTokensStudioOAuth({ context, action: 'LIST_TOKENS', data: {} })) || [];
    const setId = findStudioSet(set)?.id;
    const sanitized = sanitizeTokenName(name);
    return studioTokens!.find((token) => token.token_set_id === setId && sanitizeTokenName(token.name) === sanitized)?.id;
  };

  const updates: Array<{ token_id: string; changes: { name?: string; value?: unknown } }> = [];
  for (const { set, oldName, newName } of renames) {
    // eslint-disable-next-line no-await-in-loop
    const tokenId = await findTokenId(set, oldName);
    if (!tokenId) continue;
    // newTokens are sanitized for Studio; the renames carry the local names.
    const imported = newTokens.find((token) => token.parent === sanitizeTokenSetName(set) && token.name === sanitizeTokenName(newName));
    updates.push({ token_id: tokenId, changes: { name: sanitizeTokenName(newName), ...(imported ? { value: imported.value } : {}) } });
    renamedTokens.add(renamedTokenKey(sanitizeTokenSetName(set), sanitizeTokenName(newName)));
  }
  for (const token of updatedTokens) {
    if (!token.parent) continue;
    // eslint-disable-next-line no-await-in-loop
    const tokenId = await findTokenId(token.parent, token.name);
    if (tokenId) updates.push({ token_id: tokenId, changes: { value: token.value } });
  }

  if (updates.length > 0) {
    await pushToTokensStudioOAuth({ context, action: 'BATCH_UPDATE_TOKENS', data: updates });
  }
  return renamedTokens;
}
