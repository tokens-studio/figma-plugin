import { gql } from '@tokens-studio/sdk';

export const UPDATE_THEME_GROUP_MUTATION = gql`
  mutation UpdateThemeGroup($input: ThemeGroupUpdateInput!, $project: String!, $organization: String!) {
    updateThemeGroup(input: $input, project: $project, organization: $organization) {
      name
      options {
        name
        selectedTokenSets
        figmaStyleReferences
        figmaVariableReferences
        figmaCollectionId
        figmaModeId
      }
    }
  }
`;
