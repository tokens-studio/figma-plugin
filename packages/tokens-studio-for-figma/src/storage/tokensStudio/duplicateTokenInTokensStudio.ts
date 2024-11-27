import { RematchRootState } from '@rematch/core';
import { pushToTokensStudio } from '@/app/store/providers/tokens-studio';
import { StorageTypeCredential, TokensStudioStorageType } from '@/types/StorageType';
import { DuplicateTokenPayload, UpdateTokenPayload } from '@/types/payloads';
import { RootModel } from '@/types/RootModel';
import { updateTokenPayloadToSingleToken } from '@/utils/updateTokenPayloadToSingleToken';
import { singleTokensToRawTokenSet } from '@/utils/convert';

interface CreateTokenInTokensStudioPayload {
  rootState: RematchRootState<RootModel, Record<string, never>>;
  payload: DuplicateTokenPayload;
}

export async function duplicateTokenInTokensStudio({
  payload,
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

  const tokenSets = rootState.tokenState.tokens;

  for (const tokenSet of payload.tokenSets) {
    const tokenSetContent = tokenSets[tokenSet];
    const newTokenSetContent = [...tokenSetContent, tokenData];
    const newRawTokenSet = singleTokensToRawTokenSet(newTokenSetContent, true);

    pushToTokensStudio({
      context: rootState.uiState.api as StorageTypeCredential<TokensStudioStorageType>,
      action: 'UPDATE_TOKEN_SET',
      data: { raw: newRawTokenSet, name: tokenSet },
    });
  }
}
