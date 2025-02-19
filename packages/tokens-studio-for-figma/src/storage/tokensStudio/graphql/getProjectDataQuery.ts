import { gql } from '@tokens-studio/sdk';

export const GET_PROJECT_DATA_QUERY = gql`
  query Branch($projectId: String!, $organization: String!, $name: String) {
    project(id: $projectId, organization: $organization) {
      branch(name: $name) {
        tokenSets(limit: 1000) {
          data {
            name
            orderIndex
            type
            raw
          }
          totalPages
        }
        themeGroups {
          data {
            name
            options {
              name
              figmaStyleReferences
              figmaVariableReferences
              selectedTokenSets
              figmaCollectionId
              figmaModeId
            }
          }
        }
      }
    }
  }
`;
