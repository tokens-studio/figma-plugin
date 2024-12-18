import { gql } from '@tokens-studio/sdk';

export const CREATE_TOKEN_SET_MUTATION = gql`
mutation CreateTokenSet($input: TokenSetInput!, $project: String!, $organization: String!) {
  createTokenSet(input: $input, project: $project, organization: $organization) {
    name
  }
}
`;
