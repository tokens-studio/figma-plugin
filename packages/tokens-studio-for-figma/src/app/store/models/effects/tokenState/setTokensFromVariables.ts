import type { RematchDispatch } from '@rematch/core';
import type { RootModel } from '@/types/RootModel';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { pushToTokensStudioOAuth } from '../../../providers/tokens-studio/tokensStudioOAuth';
import { pushThemeToTokensStudioOAuth } from './utils/pushThemeToTokensStudioOAuth';
import { store } from '@/app/store';
import type { SetTokensFromVariablesPayload } from '@/types/payloads';

export function setTokensFromVariables(dispatch: RematchDispatch<RootModel>) {
  return async (_payload: SetTokensFromVariablesPayload, _rootState: any): Promise<void> => {
    const currentState = store.getState();
    if (currentState?.uiState?.api?.provider !== StorageProviderType.TOKENS_STUDIO_OAUTH) return;

    const context = currentState.uiState.api;
    const hasChangeSetId = !!(context as any)?.changeSetId;
    const { importedTokens } = currentState.tokenState;
    const newTokens = (importedTokens?.newTokens || []).filter((t) => t.parent != null);

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
        const existingSetId = (currentState.tokenState.tokenSetMetadata[setName] as any)?.id;
        let tokenSetId = existingSetId;

        if (!tokenSetId) {
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

    // Yield the event loop before reading importedThemes. When hasChangeSetId is false there are
    // no awaits above, so without this yield the effect runs synchronously and reads importedThemes
    // before setThemesFromVariables (dispatched next in Initiator.tsx) has populated it.
    await Promise.resolve();

    // Push themes after token sets are created (so selected_token_sets are ready).
    // setThemesFromVariables skips this when new tokens are present to avoid
    // sending theme options before token sets exist on the server.
    const stateAfterSets = store.getState();
    const { importedThemes } = stateAfterSets.tokenState;
    if (hasChangeSetId && importedThemes) {
      const newThemesToPush = (importedThemes.newThemes || []).map((t: any) => ({ ...t, id: undefined }));
      const updatedThemesToPush = importedThemes.updatedThemes || [];
      // Push themes sequentially so that a shared theme group (e.g. "appearances") is only created
      // once — concurrent pushes would both see groupId=null and create duplicate groups.
      for (const theme of [...newThemesToPush, ...updatedThemesToPush]) {
        // eslint-disable-next-line no-await-in-loop
        await pushThemeToTokensStudioOAuth(theme, stateAfterSets, dispatch);
      }
    }
  };
}
