import { RematchRootState } from '@rematch/core';
import { pushToTokensStudio } from '@/app/store/providers/tokens-studio';
import { StorageTypeCredential, TokensStudioStorageType } from '@/types/StorageType';
import { UpdateTokenPayload } from '@/types/payloads';
import { RootModel } from '@/types/RootModel';
import { SingleToken } from '@/types/tokens';
import { singleTokensToRawTokenSet } from '@/utils/convert';

interface CreateTokenInTokensStudioPayload {
  rootState: RematchRootState<RootModel, Record<string, never>>;
  payload: UpdateTokenPayload;
}

export async function createTokenInTokensStudio({
  payload,
  rootState,
}: CreateTokenInTokensStudioPayload) {
  const tokenSet = rootState.tokenState.tokens[payload.parent];

  if (!tokenSet) {
    throw new Error('Token set not found');
  }

  const newToken = {
    name: payload.name,
    type: payload.type,
    value: payload.value,
    description: payload.description,
    $extensions: payload.$extensions,
  } as SingleToken;

  const newSet = [...tokenSet, newToken];
  const dtcgSet = singleTokensToRawTokenSet(newSet, true);

  pushToTokensStudio({
    context: rootState.uiState.api as StorageTypeCredential<TokensStudioStorageType>,
    action: 'UPDATE_TOKEN_SET',
    data: {
      raw: dtcgSet,
      name: payload.parent,
    },
    metadata: rootState.tokenState.tokenSetMetadata,
  });
}
