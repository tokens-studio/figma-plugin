export const GET_TOKENS_QUERY = `query TokenSets(
    $filter: TokenSetsFilterInput
    $limit: Int
    $offset: Int
    $project: String!
  ) {
    tokenSets(
      filter: $filter
      limit: $limit
      offset: $offset
      project: $project
    ) {
      urn
      name
      projectUrn
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
            border {
              width
              style
              color
            }
          }
          ... on Raw_Token_boxShadow {
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
  }
  `;
