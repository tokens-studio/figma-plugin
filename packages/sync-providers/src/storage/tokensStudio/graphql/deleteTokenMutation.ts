import { TOKEN_FRAGMENT } from './tokenFragment';

export const DELETE_TOKEN_MUTATION = `
mutation DeleteToken($urn: String!) {
    deleteToken(urn: $urn) {
        ${TOKEN_FRAGMENT}
    }
}
`;
