import { gql } from '@tokens-studio/sdk';

export const GET_PROJECT_DATA_QUERY = gql`
  query Branch($projectId: String!, $organization: String!, $name: String) {
    project(id: $projectId, organization: $organization) {
      branch(name: $name) {
        tokenSets(limit: 100) {
          data {
            name
            orderIndex
            type
            tokens {
              name
              type
              description
              extensions
              value
            }
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
            }
          }
        }
      }
    }
  }
`;
