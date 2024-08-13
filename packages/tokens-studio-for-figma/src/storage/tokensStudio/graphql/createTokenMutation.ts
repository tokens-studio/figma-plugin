import { TOKEN_FRAGMENT } from './tokenFragment';

export const CREATE_TOKEN_MUTATION = `
    mutation CreateToken($set: String!, $input: TokenInput!) {
        createToken(set: $set, input: $input) {
            ${TOKEN_FRAGMENT}
        }
    }
`;
