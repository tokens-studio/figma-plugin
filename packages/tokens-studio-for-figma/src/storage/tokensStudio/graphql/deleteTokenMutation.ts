export const DELETE_TOKEN_MUTATION = `
mutation DeleteToken($urn: String!) {
    deleteToken(urn: $urn) {
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
