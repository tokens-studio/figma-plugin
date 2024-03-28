export const UPDATE_TOKEN_MUTATION = `mutation UpdateToken($urn: String!, $input: TokenUpdateInput!) {
    updateToken(urn: $urn, input: $input) {
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
        }
        ... on Raw_Token_border {
          value
        }
        ... on Raw_Token_boxShadow {
          value
        }
      }
    }
  }`;