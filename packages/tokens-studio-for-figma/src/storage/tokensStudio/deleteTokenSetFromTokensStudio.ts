import { RematchRootState } from '@rematch/core';
import { pushToTokensStudio } from '@/app/store/providers/tokens-studio';
import { StorageTypeCredential, TokensStudioStorageType } from '@/types/StorageType';
import { RootModel } from '@/types/RootModel';
import { TokenState } from '@/app/store/models/tokenState';

interface DeleteTokenSetFromTokensStudioPayload {
  rootState: RematchRootState<RootModel, Record<string, never>>;
  name: string;
  onTokenSetDeleted: (payload: TokenState['tokenSetMetadata']) => void;
}

export async function deleteTokenSetFromTokensStudio({
  rootState,
  name,
  onTokenSetDeleted,
}: DeleteTokenSetFromTokensStudioPayload) {
  const tokenSet = await pushToTokensStudio({
    context: rootState.uiState.api as StorageTypeCredential<TokensStudioStorageType>,
    action: 'DELETE_TOKEN_SET',
    data: { name },
    metadata: rootState.tokenState.tokenSetMetadata,
  });

  if (tokenSet) {
    const tokenSetMetadata = { ...rootState.tokenState.tokenSetMetadata };
    delete tokenSetMetadata[name];
    onTokenSetDeleted(tokenSetMetadata);
  }
}
