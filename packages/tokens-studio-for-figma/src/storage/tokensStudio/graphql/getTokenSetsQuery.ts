import { gql } from '@tokens-studio/sdk';

export const GET_TOKEN_SET_PAGE = gql`
  query TokenSetsPage(
    $projectId: String!
    $organization: String!
    $branch: String!
    $page: Int!
  ) {
    project(id: $projectId, organization: $organization) {
      branch(name: $branch) {
        tokenSets(page: $page, limit: 100) {
          nextPage
          totalPages
          data {
            name
            orderIndex
            type
            raw
          }
        }
      }
    }
  }
`;
