import { deepmerge } from 'deepmerge-ts';
import { StorageProviderType, StorageTypeCredential, StorageTypeCredentials, StorageTypeFormValues, TokensStudioStorageType } from '@/types/StorageType';
import { UpdateTokenPayload } from './payloads/UpdateTokenPayload';
// import { RootModel } from '@/types/RootModel';
import { RemoteTokenStorageMetadata } from '@/types';
import { TokensStudioTokenStorage } from '../TokensStudioTokenStorage';

interface CreateTokenInTokensStudioPayload {
  payload: UpdateTokenPayload;
  onTokenCreated: (payload: UpdateTokenPayload) => void;
  api: TokensStudioCredentials,
  tokenSetMetadata: any; // FIXME: Add type
}

type TokensStudioCredentials = Extract<StorageTypeCredentials, { provider: StorageProviderType.TOKENS_STUDIO }>;
type TokensStudioFormValues = Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.TOKENS_STUDIO }>;

export type TokensStudioAction =
  | 'CREATE_TOKEN'
  | 'EDIT_TOKEN'
  | 'DELETE_TOKEN'
  | 'CREATE_TOKEN_SET'
  | 'UPDATE_TOKEN_SET'
  | 'DELETE_TOKEN_SET'
  | 'UPDATE_TOKEN_SET_ORDER'
  | 'CREATE_THEME_GROUP'
  | 'UPDATE_THEME_GROUP'
  | 'DELETE_THEME_GROUP';

interface PushToTokensStudio {
  context: TokensStudioCredentials;
  action: TokensStudioAction;
  data: any;
  metadata?: RemoteTokenStorageMetadata['tokenSetsData'];
}

export const pushToTokensStudio = async ({
  context, action, data, metadata,
}: PushToTokensStudio) => {
  const storageClient = new TokensStudioTokenStorage(context.id, context.secret);

  return storageClient.push({
    action,
    data,
    metadata,
  });
};

export async function createTokenInTokensStudio({
  payload,
  onTokenCreated,
  api,
  tokenSetMetadata,
}: CreateTokenInTokensStudioPayload) {
  const token = await pushToTokensStudio({
    context: api as StorageTypeCredential<TokensStudioStorageType>,
    action: 'CREATE_TOKEN',
    data: payload,
    metadata: tokenSetMetadata,
  });

  if (typeof token !== 'boolean' && token?.urn) {
    onTokenCreated({
      ...payload,
      $extensions: deepmerge(payload.$extensions, { 'studio.tokens': { urn: token.urn } }),
      shouldUpdate: false,
    });
  }
}
