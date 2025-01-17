import { gql } from '@tokens-studio/sdk';

export const CREATE_THEME_GROUP_MUTATION = gql`
  mutation CreateThemeGroup($project: String!, $organization: String!, $branch: String!, $input: ThemeGroupInput!) {
    createThemeGroup(project: $project, organization: $organization, branch: $branch, input: $input) {
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
`;
