export const CREATE_TOKEN_MUTATION = `
    mutation CreateToken($set: String!, $input: TokenInput!) {
        createToken(set: $set, input: $input) {
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
    }
`;
