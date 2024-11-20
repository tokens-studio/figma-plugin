import { deepmerge } from 'deepmerge-ts';
import { RematchRootState } from '@rematch/core';
import { pushToTokensStudio } from '@/app/store/providers/tokens-studio';
import { StorageTypeCredential, TokensStudioStorageType } from '@/types/StorageType';
import { UpdateTokenPayload } from '@/types/payloads';
import { RootModel } from '@/types/RootModel';
import convertTokensToObject from '@/utils/convertTokensToObject';
import { AnyTokenList, SingleToken } from '@/types/tokens';
import { convertTokenToFormat } from '@/utils/convertTokenToFormat';

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
  console.log({ payload });
  console.log({ rootState });

  // I need to add the token to the token set, and then convert the token set to a token set object, then push the token set object to tokens studio

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

  const dtcgSet = newSet.map((token) => convertTokenToFormat(token));

  console.log({ dtcgSet });

  const tokenSetObject = convertTokensToObject({ [payload.parent]: dtcgSet }, false);

  const token = await pushToTokensStudio({
    context: rootState.uiState.api as StorageTypeCredential<TokensStudioStorageType>,
    action: 'UPDATE_TOKEN_SET',
    data: {
      raw: tokenSetObject[payload.parent],
    },
    metadata: rootState.tokenState.tokenSetMetadata,
  });

  // if (typeof token !== 'boolean' && token?.urn) {
  //   onTokenCreated({
  //     ...payload,
  //     $extensions: deepmerge(payload.$extensions, { 'studio.tokens': { urn: token.urn } }),
  //     shouldUpdate: false,
  //   });
  // }
}
