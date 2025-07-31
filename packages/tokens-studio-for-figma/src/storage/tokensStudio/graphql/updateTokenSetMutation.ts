import { gql } from '@tokens-studio/sdk';

export const UPDATE_TOKEN_SET_MUTATION = gql`
mutation UpdateTokenSet($input: TokenSetUpdateInput!, $project: String!, $organization: String!) {
  updateTokenSet(input: $input, project: $project, organization: $organization) {
    name
    tokens {
      extensions
      name
      description
      value
    }
  }
}
`;
