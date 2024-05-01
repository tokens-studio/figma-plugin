export const GET_GENERATOR_QUERY = `
query Generator($urn: String!) {
    generator(urn: $urn) {
        urn
        name
        description
        createdAt
        updatedAt
        graph
    }
}
`;
