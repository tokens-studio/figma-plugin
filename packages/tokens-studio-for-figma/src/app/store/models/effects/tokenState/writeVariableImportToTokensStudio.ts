import type { RematchDispatch } from '@rematch/core';
import type { RootModel } from '@/types/RootModel';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { pushToTokensStudioOAuth } from '../../../providers/tokens-studio/tokensStudioOAuth';
import { notifyThemePushFailures, pushThemeToTokensStudioOAuth, type ThemePushFailure } from './utils/pushThemeToTokensStudioOAuth';
import {
  lookupBySanitized,
  resolveSanitizedKey,
  sanitizeNewTokensForStudio,
  sanitizeThemeForStudio,
  sanitizeTokenName,
  sanitizeTokenSetName,
} from './utils/sanitizeForStudio';
import {
  renamedTokenKey, renameThemeGroupsInTokensStudio, renameTokenSetsInTokensStudio, updateTokensInTokensStudio,
} from './utils/renameInTokensStudio';
import { findRenamedVariableTokens } from './utils/findRenamedVariableTokens';
import { store } from '@/app/store';

// Writes a variables import to Tokens Studio. Initiator dispatches it once setTokensFromVariables and
// setThemesFromVariables have both filled the import, and before applyVariableImport applies it locally:
// everything it compares against is read from the store before its first await.
export function writeVariableImportToTokensStudio(dispatch: RematchDispatch<RootModel>) {
  return async (_payload: void, _rootState: any): Promise<void> => {
    const currentState = store.getState();
    if (currentState?.uiState?.api?.provider !== StorageProviderType.TOKENS_STUDIO_OAUTH) return;

    const context = currentState.uiState.api;
    const hasChangeSetId = !!(context as any)?.changeSetId;
    const { importedTokens, importedThemes, tokens: previousTokens = {} } = currentState.tokenState;
    // Sanitize at the studio boundary: strip characters that would corrupt the
    // ledger's reference or token-set parsing. Plugin-only flows still receive
    // the raw names because this effect only runs for TOKENS_STUDIO_OAUTH.
    let newTokens = sanitizeNewTokensForStudio(importedTokens?.newTokens || []);
    const renamedCollections = currentState.tokenState.renamedCollections ?? [];
    const previousThemes = currentState.tokenState.themes;

    let updatedTokens = importedTokens?.updatedTokens || [];

    let renamedSets: [string, string][] = [];
    if (hasChangeSetId && renamedCollections.length > 0) {
      renamedSets = await renameTokenSetsInTokensStudio(context, renamedCollections, dispatch);
      // A token that was already in a renamed set moved with it; only the set's new tokens need creating.
      const movedTokenNames = new Map(renamedSets.map(([oldName, newName]) => [
        sanitizeTokenSetName(newName),
        new Set((previousTokens[oldName] || []).map((existing) => sanitizeTokenName(existing.name))),
      ]));
      newTokens = newTokens.filter((token) => !movedTokenNames.get(token.parent!)?.has(token.name));
    }

    // Changed tokens of a renamed collection are listed as updates. Unless their set was renamed in Studio above,
    // it is new there too, so they are created with it.
    const isInNewSet = (token: { parent?: string }) => !!token.parent && !previousTokens[token.parent]
      && !renamedSets.some(([, newName]) => newName === token.parent);
    newTokens = [...newTokens, ...sanitizeNewTokensForStudio(updatedTokens.filter(isInNewSet))];
    updatedTokens = updatedTokens.filter((token) => !isInNewSet(token));

    if (hasChangeSetId) {
      // Renamed variables and changed values update the existing tokens instead of creating new ones.
      const renamedTokens = await updateTokensInTokensStudio(context, {
        renames: findRenamedVariableTokens(previousThemes, importedThemes?.updatedThemes),
        updatedTokens,
        newTokens,
        previousTokens,
        renamedSets,
      });
      newTokens = newTokens.filter((token) => !renamedTokens.has(renamedTokenKey(token.parent!, token.name)));
    }

    // Only create token sets and tokens if changeSetId is present — the REST API requires it.
    // changeSetId is populated after pulling from the REST API for a specific branch.
    if (hasChangeSetId && newTokens.length > 0) {
      // Group new tokens by their parent set name
      const tokensBySet: Record<string, typeof newTokens> = {};
      newTokens.forEach((token) => {
        const parent = token.parent!;
        if (!tokensBySet[parent]) {
          tokensBySet[parent] = [];
        }
        tokensBySet[parent].push(token);
      });

      // Create token sets sequentially (no batch API), then batch-create all their tokens in one call.
      const allTokensToCreate: Array<{ name: string; value: any; type: string; description?: string; token_set_id: string }> = [];

      for (const [setName, tokens] of Object.entries(tokensBySet)) {
        // `setName` is sanitized but the metadata map is still keyed by the raw
        // Figma name, so an exact lookup would miss and create a duplicate set.
        // Write back under the resolved key for the same reason.
        const metadata = store.getState().tokenState.tokenSetMetadata as Record<string, any>;
        // tokenSetMetadata is only filled when a pull replaces the local tokens, so it can be empty while
        // the sets exist in Studio. Fall back to the ids from the last pull: creating a set whose name is
        // taken is refused, and its tokens would never reach Studio.
        const remoteSets = store.getState().tokenState.remoteData?.metadata?.tokenSetsData as Record<string, any> | undefined;
        const metaKey = resolveSanitizedKey(metadata, setName, sanitizeTokenSetName)
          ?? resolveSanitizedKey(remoteSets, setName, sanitizeTokenSetName)
          ?? setName;
        const existingMeta = metadata[metaKey]?.id
          ? metadata[metaKey]
          : (lookupBySanitized(remoteSets, setName, sanitizeTokenSetName) ?? metadata[metaKey]);
        let tokenSetId = existingMeta?.id;

        if (tokenSetId) {
          // Set already exists on the server — mark it so createMultipleTokens skips it when
          // the user confirms in ImportedTokensDialog, avoiding duplicate token writes.
          if (!existingMeta?.fromVariableImport) {
            dispatch.tokenState.setTokenSetMetadata({
              ...store.getState().tokenState.tokenSetMetadata,
              [metaKey]: { ...existingMeta, fromVariableImport: true } as any,
            });
          }
        } else {
          // eslint-disable-next-line no-await-in-loop
          const setResult = await pushToTokensStudioOAuth({
            context: context as any,
            action: 'CREATE_TOKEN_SET',
            data: { name: setName },
          });

          if (setResult?.data?.id) {
            tokenSetId = setResult.data.id;
            // Mark fromVariableImport so createMultipleTokens skips these sets when the user
            // confirms in the ImportedTokensDialog, avoiding duplicate writes.
            dispatch.tokenState.setTokenSetMetadata({
              ...store.getState().tokenState.tokenSetMetadata,
              [setName]: { id: tokenSetId, isDynamic: false, fromVariableImport: true } as any,
            });
          }
        }

        if (tokenSetId) {
          tokens.forEach((token) => {
            allTokensToCreate.push({
              name: token.name,
              value: token.value,
              type: token.type,
              description: token.description,
              token_set_id: tokenSetId,
            });
          });
        }
      }

      // Batch-create all tokens in a single request.
      if (allTokensToCreate.length > 0) {
        await pushToTokensStudioOAuth({
          context: context as any,
          action: 'BATCH_CREATE_TOKENS',
          data: allTokensToCreate,
        });
      }
    }

    // Push themes after token sets are created (so selected_token_sets are ready).
    const stateAfterSets = store.getState();
    if (hasChangeSetId && importedThemes) {
      await renameThemeGroupsInTokensStudio(context, previousThemes, importedThemes.updatedThemes || [], dispatch);
      const newThemesToPush = (importedThemes.newThemes || []).map((t: any) => sanitizeThemeForStudio({ ...t, id: undefined }));
      const updatedThemesToPush = (importedThemes.updatedThemes || []).map((t: any) => sanitizeThemeForStudio(t));
      // Push themes sequentially so that a shared theme group (e.g. "appearances") is only created
      // once — concurrent pushes would both see groupId=null and create duplicate groups.
      const failures: ThemePushFailure[] = [];
      for (const theme of [...newThemesToPush, ...updatedThemesToPush]) {
        // eslint-disable-next-line no-await-in-loop
        const result = await pushThemeToTokensStudioOAuth(theme, stateAfterSets, dispatch, { notifyOnFailure: false });
        if (!result.ok) failures.push(result.failure);
      }
      // One message for the whole import rather than one per refused theme.
      notifyThemePushFailures(failures);
    }
  };
}
