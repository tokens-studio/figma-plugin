import { RematchRootState } from '@rematch/core';
import { pushToTokensStudio } from '@/app/store/providers/tokens-studio';
import { StorageTypeCredential, TokensStudioStorageType } from '@/types/StorageType';
import { RootModel } from '@/types/RootModel';
import { TokenState } from '@/app/store/models/tokenState';

interface CreateTokenSetInTokensStudioPayload {
  rootState: RematchRootState<RootModel, Record<string, never>>;
  name: string;
  onTokenSetCreated: (payload: TokenState['tokenSetMetadata']) => void;
}

export async function createTokenSetInTokensStudio({
  rootState,
  name,
  onTokenSetCreated,
}: CreateTokenSetInTokensStudioPayload) {
  const orderIndex = Object.keys(rootState.tokenState.tokens).length;

  pushToTokensStudio({
    context: rootState.uiState.api as StorageTypeCredential<TokensStudioStorageType>,
    action: 'CREATE_TOKEN_SET',
    data: { name, orderIndex },
    successCallback: () => {
      onTokenSetCreated({
        ...rootState.tokenState.tokenSetMetadata,
        [name]: {
          isDynamic: false,
        },
      });
    },
  });
}
