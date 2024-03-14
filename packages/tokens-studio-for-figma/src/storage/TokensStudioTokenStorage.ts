import {
  Graphql,
  Configuration,
  CreateTokenMutation,
  UpdateTokenMutation,
  DeleteTokenMutation,
  TokenSetsQuery,
  RawToken,
  Raw_Token_border,
  Raw_Token_boxShadow,
} from '@tokens-studio/sdk';
import { deepmerge } from 'deepmerge-ts';
import * as Sentry from '@sentry/react';
import { AnyTokenSet, SingleToken } from '@/types/tokens';
import { notifyToUI } from '@/plugin/notifiers';
import {
  RemoteTokenStorage,
  RemoteTokenstorageErrorMessage,
  RemoteTokenStorageFile,
  RemoteTokenStorageMetadata,
} from './RemoteTokenStorage';
import { ErrorMessages } from '../constants/ErrorMessages';
import { SaveOption } from './FileTokenStorage';
import { TokensStudioAction } from '@/app/store/providers/tokens-studio';
import {
  GET_TOKENS_QUERY,
  CREATE_TOKEN_MUTATION,
  UPDATE_TOKEN_MUTATION,
  DELETE_TOKEN_MUTATION,
} from './tokensStudio/graphql';
import { track } from '@/utils/analytics';

export type TokensStudioSaveOptions = {
  commitMessage?: string;
};

interface Token {
  description?: string | null | undefined;
  type: string | null | undefined;
  value: any;
  $extensions?: SingleToken['$extensions'];
}

const removeNulls = (obj: any) => Object.fromEntries(Object.entries(obj).filter(([key, v]) => v !== null));

// We need to convert the raw token data from the GraphQL API into a format that the plugin will understand,
// as there's some differences between the two. Ideally, we could just pass in a "request format"
// into the query, but that's not possible so far.
const tsToToken = (raw: RawToken) => {
  const combined: Token = {
    type: raw.type,
    value: null,
    $extensions: {
      id: raw.urn!,
    },
  };

  if (raw.description) {
    combined.description = raw.description;
  }

  if (raw.extensions) {
    // @ts-ignore
    combined.$extensions = deepmerge(JSON.parse(raw.extensions), combined.$extensions);
  }

  // @ts-ignore
  if (raw.value.typography) {
    // @ts-ignore typography exists for typography tokens
    combined.value = removeNulls((raw as RawToken).value!.typography!);
    // @ts-ignore
  } else if (raw.value.border) {
    // @ts-ignore border exists for border tokens
    combined.value = removeNulls((raw as unknown as Raw_Token_border).value!.border!);
    // @ts-ignore
  } else if (raw.value.boxShadow) {
    // @ts-ignore
    combined.value = (raw as Raw_Token_boxShadow).value!.boxShadow;
  } else {
    combined.value = raw.value!.value;
  }

  return combined;
};

type TokensData = {
  tokens: AnyTokenSet | null | undefined;
  tokenSets: {
    [tokenSetName: string]: { id: string };
  };
} | null;

async function getTokens(urn: string): Promise<TokensData> {
  try {
    const data = await Graphql.exec<TokenSetsQuery>(
      Graphql.op(GET_TOKENS_QUERY, {
        limit: 500,
        project: urn,
      }),
    );

    if (!data.data) {
      return null;
    }

    const returnData: TokensData = data.data.tokenSets.reduce(
      (acc, tokenSet) => {
        if (!tokenSet.name) return acc;
        acc.tokens[tokenSet.name] = tokenSet.tokens.reduce((tokenSetAcc, token) => {
          // We know that name exists (required field)
          tokenSetAcc[token.name!] = tsToToken(token);
          return tokenSetAcc;
        }, {});

        acc.tokenSets[tokenSet.name] = { id: tokenSet.urn };

        return acc;
      },
      { tokens: {}, tokenSets: {} },
    );
    return returnData;
  } catch (e) {
    Sentry.captureException(e);
    console.error('Error fetching tokens', e);
    return null;
  }
}

export class TokensStudioTokenStorage extends RemoteTokenStorage<TokensStudioSaveOptions, SaveOption> {
  private id: string;

  private secret: string;

  constructor(id: string, secret: string) {
    super();
    this.id = id;
    this.secret = secret;
    // Note: there seems to be an issue with "Admin" API keys not being able to access resources currently, for now this won't work.
    Configuration.setAPIKey(secret);
  }

  public async read(): Promise<RemoteTokenStorageFile[] | RemoteTokenstorageErrorMessage> {
    let payload: AnyTokenSet | null | undefined = {};
    const metadata: RemoteTokenStorageMetadata = {};

    try {
      const tokensData = await getTokens(this.id);
      payload = tokensData?.tokens;

      if (tokensData?.tokenSets) {
        metadata.tokenSetsData = tokensData?.tokenSets ?? {};
      }
    } catch (error) {
      // We get errors in a slightly changed format from the backend
      if (payload?.errors) console.log('Error is', payload.errors[0].message);
      return {
        errorMessage: payload?.errors ? payload.errors[0].message : ErrorMessages.TOKENSSTUDIO_CREDENTIAL_ERROR,
      };
    }
    if (payload) {
      // @ts-ignore typescript is giving me a great friday morning
      const returnPayload: RemoteTokenStorageFile[] = Object.entries(payload).map(([filename, data]) => ({
        name: filename,
        type: 'tokenSet',
        path: filename,
        data,
      }));

      if (metadata) {
        returnPayload.push({
          type: 'metadata',
          path: 'metadata',
          data: metadata,
        });
      }

      return returnPayload;
    }
    return {
      errorMessage: ErrorMessages.TOKENSSTUDIO_READ_ERROR,
    };
  }

  public async write(
    // TODO: Add wrtie support
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    files: RemoteTokenStorageFile<TokensStudioSaveOptions>[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    saveOptions?: SaveOption | undefined,
  ): Promise<boolean> {
    console.log('WRITE NOT IMPLEMENTED', files, saveOptions);
    return undefined as any;
  }

  public async push({
    action,
    data,
    metadata,
  }: {
    action: TokensStudioAction;
    data: any;
    metadata?: RemoteTokenStorageMetadata['tokenSetsData'];
  }) {
    switch (action) {
      case 'CREATE_TOKEN': {
        try {
          const setId = metadata?.[data.parent]?.id;

          if (!setId) {
            return null;
          }

          const responseData = await Graphql.exec<CreateTokenMutation>(
            Graphql.op(CREATE_TOKEN_MUTATION, {
              set: setId,
              input: {
                name: data.name,
                type: data.type,
                description: data.description,
                value: data.value,
                extensions: JSON.stringify(data.$extensions),
              },
            }),
          );

          if (!responseData.data) {
            return null;
          }

          track('Create token in Tokens Studio');
          notifyToUI('Token pushed to Tokens Studio', { error: false });

          return responseData.data.createToken;
        } catch (e) {
          Sentry.captureException(e);
          console.error('Error creating token in Tokens Studio', e);
          return null;
        }
      }
      case 'EDIT_TOKEN': {
        const tokenId = data.$extensions?.id;

        if (!tokenId) {
          console.error('No token ID found for token. Cannot update Tokens Studio', data);
          return null;
        }

        try {
          const responseData = await Graphql.exec<UpdateTokenMutation>(
            Graphql.op(UPDATE_TOKEN_MUTATION, {
              urn: tokenId,
              input: {
                name: data.name,
                description: data.description,
                value: data.value,
                extensions: JSON.stringify(data.$extensions),
              },
            }),
          );

          if (!responseData.data) {
            return null;
          }

          track('Edit token in Tokens Studio');
          notifyToUI('Token updated in Tokens Studio', { error: false });

          return responseData.data.updateToken;
        } catch (e) {
          Sentry.captureException(e);
          console.error('Error updating token in Tokens Studio', e);
          return null;
        }
      }
      case 'DELETE_TOKEN': {
        if (!data.sourceId) {
          console.error('No token ID found for token. Cannot remove from Tokens Studio', data);
          return null;
        }

        try {
          const responseData = await Graphql.exec<DeleteTokenMutation>(
            Graphql.op(DELETE_TOKEN_MUTATION, {
              urn: data.sourceId,
            }),
          );

          if (!responseData.data) {
            return null;
          }

          track('Delete token from Tokens Studio');
          notifyToUI('Token removed from Tokens Studio', { error: false });

          return responseData.data.deleteToken;
        } catch (e) {
          Sentry.captureException(e);
          console.error('Error removing token from Tokens Studio', e);
          return null;
        }
        break;
      }
      default:
        throw new Error(`Unimplemented storage provider for ${action}`);
    }
  }
}
