import { ExternalLoadOptions } from '@tokens-studio/graph-engine';
import { Graphql, TokenSetQuery } from '@tokens-studio/sdk';
import { GET_TOKEN_SET_QUERY } from '../graphql';
import { tokensStudioToToken } from '../utils';

export const externalLoader = async (opts: ExternalLoadOptions) => {
  try {
    const data = await Graphql.exec<TokenSetQuery>(
      Graphql.op(GET_TOKEN_SET_QUERY, {
        urn: opts.data.urn,
      }),
    );

    const responseTokens = data.data?.tokenSet?.tokens;

    if (!responseTokens) {
      return { tokens: [] };
    }

    const tokens = responseTokens.map((token) => tokensStudioToToken(token));

    return { tokens };
  } catch (error) {
    console.error(error);
    return { tokens: [] };
  }
};
