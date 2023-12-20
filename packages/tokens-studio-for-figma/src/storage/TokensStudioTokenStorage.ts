import {
  UserAuth,
  Graphql,
  Configuration,
  TokenSetsQuery,
  RawToken,
  Raw_Token_typography,
  Raw_Token_border,
  Raw_Token_boxShadow,
} from '@tokens-studio/sdk';
import { AnyTokenSet } from '@/types/tokens';
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
  if (raw.typography) {
    combined.value = removeNulls((raw as unknown as Raw_Token_typography).typography!);
    // @ts-ignore
  } else if (raw.border) {
    combined.value = removeNulls((raw as unknown as Raw_Token_border).border!);
    // @ts-ignore
  } else if (raw.boxShadow) {
    // @ts-ignore
    combined.value = (raw as Raw_Token_boxShadow).boxShadow.map((x) => removeNulls(x));
  } else {
    combined.value = raw.value;
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
        }
        ... on Raw_Token_border {
            value
        }
        ... on Raw_Token_boxShadow {
            value
        }
      }
    }
  }
}`,
      {
        limit: 200,
        project: urn,
      },
    ),
  );

  if (!data.data) {
    console.log('No data found');
    return null;
  }

  let returnData;

  console.log('received data', data);

  await Promise.all(
    data.data.tokenSets.map(async (tokenSet) => {
      console.log('Tokenset', tokenSet.name, tokenSet.tokens.length, tokenSet.tokens);
      returnData.push({
        name: tokenSet.name,
        tokens: tokenSet.tokens.map((token) => tsToToken(token)),
      });
    }),
  );
  return returnData;
}

export class TokensStudioTokenStorage extends RemoteTokenStorage<TokensStudioSaveOptions, SaveOption> {
  private id: string;

  private secret: string;

  constructor(id: string, secret: string) {
    super();
    this.id = id;
    this.secret = secret;
    console.log('Setting api key', secret);
    Configuration.setAPIKey(secret); // there seems to be an issue with "Admin" API keys not being able to access resources
  }

  public async read(): Promise<RemoteTokenStorageFile[] | RemoteTokenstorageErrorMessage> {
    let payload: AnyTokenSet | null = {};
    try {
      try {
        payload = await getTokens(this.id);
        console.log('Data is', payload);
        // payload = data.data; // Discard all the other data that we get from the API and only focus on payload
      } catch (error) {
        // There is nothing to read
        console.log(error);
        return [];
      }
      return [
        {
          filename: 'test.json',
          // @ts-ignore
          data: payload,
        },
      ];
    } catch (error) {
      console.error(error);
      return {
        errorMessage: ErrorMessages.SUPERNOVA_CREDENTIAL_ERROR,
      };
    }
  }

  public async write(
    files: RemoteTokenStorageFile<TokensStudioSaveOptions>[],
    saveOptions?: SaveOption | undefined,
  ): Promise<boolean> {
    console.log('WRITE NOT IMPLEMENTED');
    return undefined as any;
  }
}
