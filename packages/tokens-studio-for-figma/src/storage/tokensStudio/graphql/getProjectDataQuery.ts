export const GET_PROJECT_DATA_QUERY = `
query Project($urn: String!) {
  project(urn: $urn) {
    sets {
      urn
      name
      type
      projectUrn
      orderIndex
      tokens(limit: 400) {
        description
        name
        urn
        extensions
        setUrn
        type
        value {
          ... on Raw_Token_scalar {
            value
          }
          ... on Raw_Token_typography {
            value
            typography {
              textDecoration
              textCase
              lineHeight
              letterSpacing
              fontSize
              fontFamily
              fontWeight
              paragraphIndent
              paragraphSpacing
            }
          }
          ... on Raw_Token_border {
            value
            border {
              width
              style
              color
            }
          }
          ... on Raw_Token_boxShadow {
            value
            boxShadow {
              x
              y
              blur
              spread
              color
              type
            }
          }
        }
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
