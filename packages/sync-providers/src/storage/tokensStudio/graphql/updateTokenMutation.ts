import { TOKEN_FRAGMENT } from './tokenFragment';

export const UPDATE_TOKEN_MUTATION = `
mutation UpdateToken($urn: String!, $input: TokenUpdateInput!) {
    updateToken(urn: $urn, input: $input) {
      ${TOKEN_FRAGMENT}
    }
}`;
