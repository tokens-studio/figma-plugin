export const UPDATE_TOKEN_SET_MUTATION = `mutation UpdateTokenSet($urn: String!, $input: TokenSetUpdateInput!) {
  updateTokenSet(urn: $urn, input: $input) {
    urn
    name
    projectUrn
    type
  }
}
`;
