import { RematchRootState } from '@rematch/core';
import { pushToTokensStudio } from '@/app/store/providers/tokens-studio';
import { StorageTypeCredential, TokensStudioStorageType } from '@/types/StorageType';
import { RootModel } from '@/types/RootModel';
import { TokenState } from '@/app/store/models/tokenState';

interface UpdateTokenSetInTokensStudioPayload {
  rootState: RematchRootState<RootModel, Record<string, never>>;
  data: { oldName: string; newName: string };
  onTokenSetUpdated: (payload: TokenState['tokenSetMetadata']) => void;
}

export async function updateTokenSetInTokensStudio({
  rootState,
  data,
  onTokenSetUpdated,
}: UpdateTokenSetInTokensStudioPayload) {
  const tokenSet = await pushToTokensStudio({
    context: rootState.uiState.api as StorageTypeCredential<TokensStudioStorageType>,
    action: 'UPDATE_TOKEN_SET',
    data,
    metadata: rootState.tokenState.tokenSetMetadata,
  });

  if (typeof tokenSet !== 'boolean' && tokenSet?.urn) {
    const tokenSetMetadata = { ...rootState.tokenState.tokenSetMetadata };
    delete tokenSetMetadata[data.oldName];

    onTokenSetUpdated({
      ...tokenSetMetadata,
      [data.newName]: {
        id: tokenSet.urn,
      },
    });
  }
}
