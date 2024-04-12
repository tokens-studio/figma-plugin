import { deepmerge } from 'deepmerge-ts';
import { RematchRootState } from '@rematch/core';
import { pushToTokensStudio } from '@/app/store/providers/tokens-studio';
import { StorageTypeCredential, TokensStudioStorageType } from '@/types/StorageType';
import { UpdateTokenPayload } from '@/types/payloads';
import { RootModel } from '@/types/RootModel';

interface CreateTokenInTokensStudioPayload {
  rootState: RematchRootState<RootModel, Record<string, never>>;
  payload: UpdateTokenPayload;
  onTokenCreated: (payload: UpdateTokenPayload) => void;
}

export async function createTokenInTokensStudio({
  payload,
  onTokenCreated,
  rootState,
}: CreateTokenInTokensStudioPayload) {
  const token = await pushToTokensStudio({
    context: rootState.uiState.api as StorageTypeCredential<TokensStudioStorageType>,
    action: 'CREATE_TOKEN',
    data: payload,
    metadata: rootState.tokenState.tokenSetMetadata,
  });

  if (typeof token !== 'boolean' && token?.urn) {
    onTokenCreated({
      ...payload,
      $extensions: deepmerge(payload.$extensions, { 'studio.tokens': { urn: token.urn } }),
      shouldUpdate: false,
    });
  }
}
