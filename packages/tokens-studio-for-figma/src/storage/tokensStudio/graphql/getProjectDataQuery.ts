import { TOKEN_FRAGMENT } from './tokenFragment';

export const GET_PROJECT_DATA_QUERY = `
query Project($urn: String!) {
  project(urn: $urn) {
    sets {
      urn
      name
      type
      projectUrn
      generatorUrn
      orderIndex
      tokens(limit: 400) {
        ${TOKEN_FRAGMENT}
      }
    }
    themeGroups {
      urn
      name
      options {
        urn
        name
        selectedTokenSets
        figmaStyleReferences
        figmaVariableReferences
      }
    }
  }
}
`;
