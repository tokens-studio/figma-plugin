export const DELETE_TOKEN_SET_MUTATION = `mutation DeleteTokenSet($urn: String!) {
  deleteTokenSet(urn: $urn) {
    urn
    name
  }
}
`;
