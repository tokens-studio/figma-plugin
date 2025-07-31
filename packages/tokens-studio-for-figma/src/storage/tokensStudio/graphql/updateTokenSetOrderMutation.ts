import { gql } from '@tokens-studio/sdk';

export const UPDATE_TOKEN_SET_ORDER_MUTATION = gql`
mutation UpdateTokenSetsOrder($updates: [TokenSetOrderInput!]!, $project: String!, $organization: String!) {
  updateTokenSetsOrder(updates: $updates, project: $project, organization: $organization) {
    name
    orderIndex
    type
    tokens {
      description
      type
      name
      extensions
    }
  }
}
`;
