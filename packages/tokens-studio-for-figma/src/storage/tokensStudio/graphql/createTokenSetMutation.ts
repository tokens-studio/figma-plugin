export const CREATE_TOKEN_SET_MUTATION = `
mutation CreateTokenSet($project: String!, $input: TokenSetInput!) {
    createTokenSet(project: $project, input: $input) {
        urn
        name
        projectUrn
        type
        createdAt
    }
}
`;
