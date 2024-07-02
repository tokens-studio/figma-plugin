import { deepmerge } from 'deepmerge-ts';
import { RematchRootState } from '@rematch/core';
import { pushToTokensStudio } from '@/app/store/providers/tokens-studio';
import { StorageTypeCredential, TokensStudioStorageType } from '@/types/StorageType';
import { DuplicateTokenPayload, UpdateTokenPayload } from '@/types/payloads';
import { RootModel } from '@/types/RootModel';
import { updateTokenPayloadToSingleToken } from '@/utils/updateTokenPayloadToSingleToken';

interface CreateTokenInTokensStudioPayload {
  rootState: RematchRootState<RootModel, Record<string, never>>;
  payload: DuplicateTokenPayload;
  onTokenDuplicated: (payload: UpdateTokenPayload) => void;
}

export async function duplicateTokenInTokensStudio({
  payload,
  onTokenDuplicated,
  rootState,
}: CreateTokenInTokensStudioPayload) {
  const tokenData = updateTokenPayloadToSingleToken({
    parent: payload.parent,
    name: payload.newName,
    type: payload.type,
    value: payload.value,
    description: payload.description,
    oldName: payload.oldName,
    $extensions: payload.$extensions,
  } as UpdateTokenPayload);

  const tokens = await Promise.all(
    payload.tokenSets.map((tokenSet) => pushToTokensStudio({
      context: rootState.uiState.api as StorageTypeCredential<TokensStudioStorageType>,
      action: 'CREATE_TOKEN',
      data: {
        ...tokenData,
        parent: tokenSet,
      },
      metadata: rootState.tokenState.tokenSetMetadata,
    })),
  );

  tokens.forEach((token, index) => {
    if (typeof token !== 'boolean' && token?.urn) {
      onTokenDuplicated({
        ...tokenData,
        parent: payload.tokenSets[index],
        $extensions: deepmerge(tokenData.$extensions, { 'studio.tokens': { urn: token.urn } }),
        shouldUpdate: false,
      });
    }
  });
}
