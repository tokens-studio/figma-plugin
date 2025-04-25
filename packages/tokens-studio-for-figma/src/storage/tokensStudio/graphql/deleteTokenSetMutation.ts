import { gql } from '@tokens-studio/sdk';

export const DELETE_TOKEN_SET_MUTATION = gql`
mutation DeleteSet($branch: String!, $path: String!, $project: String!, $organization: String!) {
  deleteSet(branch: $branch, path: $path, project: $project, organization: $organization) {
      name    
  }
}
`;
