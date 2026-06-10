import type { RematchDispatch } from '@rematch/core';
import type { RootModel } from '@/types/RootModel';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { pushToTokensStudioOAuth } from '../../../providers/tokens-studio/tokensStudioOAuth';
import { store } from '@/app/store';
import type { CreateSingleTokenData } from '@/app/store/useManageTokens';

// Fires when the user clicks "Import All" in ImportedTokensDialog (via importMultipleTokens).
// For Tokens Studio OAuth projects this writes the confirmed tokens to the REST API.
//
// Variable import tokens are skipped here — setTokensFromVariables already wrote them and
// recorded their set IDs in tokenSetMetadata. Only sets with no tracked server ID are created.
export function createMultipleTokens(dispatch: RematchDispatch<RootModel>) {
  return async (payload: CreateSingleTokenData[], _rootState: any): Promise<void> => {
    const currentState = store.getState();
    if (currentState?.uiState?.api?.provider !== StorageProviderType.TOKENS_STUDIO_OAUTH) return;

    const context = currentState.uiState.api;
    const hasChangeSetId = !!(context as any)?.changeSetId;
    if (!hasChangeSetId) return;
    if (!payload || payload.length === 0) return;

    // Group tokens by their parent set
    const tokensBySet: Record<string, CreateSingleTokenData[]> = {};
    payload.forEach((token) => {
      if (!tokensBySet[token.parent]) {
        tokensBySet[token.parent] = [];
      }
      tokensBySet[token.parent].push(token);
    });

    const allTokensToCreate: Array<{ name: string; value: any; type: string; description?: string; token_set_id: string }> = [];

    for (const [setName, tokens] of Object.entries(tokensBySet)) {
      const setMeta = store.getState().tokenState.tokenSetMetadata[setName] as any;

      if (setMeta?.fromVariableImport) {
        // These tokens were already written by setTokensFromVariables — skip to avoid duplicates.
        // Clear the ephemeral flag so future imports into this set are not skipped.
        dispatch.tokenState.setTokenSetMetadata({
          ...store.getState().tokenState.tokenSetMetadata,
          [setName]: { id: setMeta.id, isDynamic: setMeta.isDynamic },
        });
      } else {
        // Resolve or create the server ID for this token set.
        let tokenSetId: string | undefined = setMeta?.id;

        if (!tokenSetId) {
          // eslint-disable-next-line no-await-in-loop
          const setResult = await pushToTokensStudioOAuth({
            context: context as any,
            action: 'CREATE_TOKEN_SET',
            data: { name: setName },
          });

          if (setResult?.data?.id) {
            tokenSetId = setResult.data.id;
            dispatch.tokenState.setTokenSetMetadata({
              ...store.getState().tokenState.tokenSetMetadata,
              [setName]: { id: tokenSetId, isDynamic: false },
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
              token_set_id: tokenSetId!,
            });
          });
        }
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
  };
}
