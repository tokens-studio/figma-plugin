import { gql } from '@tokens-studio/sdk';

export const DELETE_THEME_GROUP_MUTATION = gql`
mutation DeleteThemeGroup($branch: String!, $themeGroupName: String!, $project: String!, $organization: String!) {
  deleteThemeGroup(branch: $branch, themeGroupName: $themeGroupName, project: $project, organization: $organization) {
      name
  }
}
`;
