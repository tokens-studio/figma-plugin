import { gql } from '@tokens-studio/sdk';

export const GET_PROJECT_DATA_QUERY = gql`
  query Branch($projectId: String!, $organization: String!, $branch: String) {
    project(id: $projectId, organization: $organization) {
      branch(name: $branch) {
        themeGroups {
          data {
            id
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
