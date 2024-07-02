import { TOKEN_FRAGMENT } from './tokenFragment';

export const GET_TOKEN_SET_QUERY = `
query TokenSet($urn: String!) {
    tokenSet(urn: $urn) {
        urn
        metadata {
            createdAt
        }
        name
        projectUrn
        type
        generatorUrn
        orderIndex
        createdAt
        tokens {
            ${TOKEN_FRAGMENT}
        }
    }
}
`;
