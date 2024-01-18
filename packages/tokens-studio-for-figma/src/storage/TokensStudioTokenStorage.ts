import {
  Graphql,
  Configuration,
  TokenSetsQuery,
  RawToken,
  Raw_Token_border,
  Raw_Token_boxShadow,
} from '@tokens-studio/sdk';
import { AnyTokenSet, SingleToken } from '@/types/tokens';
import { RemoteTokenStorage, RemoteTokenstorageErrorMessage, RemoteTokenStorageFile } from './RemoteTokenStorage';
import { ErrorMessages } from '../constants/ErrorMessages';
import { SaveOption } from './FileTokenStorage';

export type TokensStudioSaveOptions = {
  commitMessage?: string;
};

interface Token {
  description?: string | null | undefined;
  type: string | null | undefined;
  value: any;
}

const removeNulls = (obj: any) => Object.fromEntries(Object.entries(obj).filter(([key, v]) => v !== null));

// We need to convert the raw token data from the GraphQL API into a format that the plugin will understand,
// as there's some differences between the two. Ideally, we could just pass in a "request format"
// into the query, but that's not possible so far.
const tsToToken = (raw: RawToken) => {
  const combined: Token = {
    type: raw.type,
    value: null,
  };

  if (raw.description) {
    combined.description = raw.description;
  }

  if (raw.extensions) {
    // @ts-ignore
    combined.$extensions = JSON.parse(raw.extensions);
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

async function getTokens(urn: string): Promise<AnyTokenSet | null> {
  const data = await Graphql.exec<TokenSetsQuery>(
    Graphql.op(
      `query TokenSets(
    $filter: TokenSetsFilterInput
    $limit: Int
    $offset: Int
    $project: String!
) {
    tokenSets(
    filter: $filter
    limit: $limit
    offset: $offset
    project: $project
    ) {
    urn
    name
    projectUrn
    tokens(limit: 400) {
      description
      name
      urn
      extensions
      setUrn
      metadata {
          createdAt
      }
      type
      value {
        ... on Raw_Token_scalar {
            value
        }
        ... on Raw_Token_typography {
          value
          typography {
            textDecoration
            textCase
            lineHeight
            letterSpacing
            fontSize
            fontFamily
            fontWeight
            paragraphIndent
            paragraphSpacing
          }
        }
        ... on Raw_Token_border {
            border {
              width
              style
              color
            }
        }
        ... on Raw_Token_boxShadow {
            boxShadow {
              x
              y
              blur
              spread
              color
              type
            }
        }
      }
    }
  }
}`,
      {
        limit: 500,
        project: urn,
      },
    ),
  );

  if (!data.data) {
    return null;
  }

  const returnData: Record<string, SingleToken<true>> = data.data.tokenSets.reduce((acc, tokenSet) => {
    if (!tokenSet.name) return acc;
    acc[tokenSet.name] = tokenSet.tokens.reduce((tokenSetAcc, token) => {
      // We know that name exists (required field)
      tokenSetAcc[token.name!] = tsToToken(token);
      return tokenSetAcc;
    }, {});
    return acc;
  }, {});

  return returnData;
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
    let payload: AnyTokenSet | null = {};

    try {
      payload = await getTokens(this.id);
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
    console.log('WRITE NOT IMPLEMENTED');
    return undefined as any;
  }
}
