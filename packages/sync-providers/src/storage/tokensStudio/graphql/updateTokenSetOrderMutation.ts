export const UPDATE_TOKEN_SET_ORDER_MUTATION = `
mutation UpdateTokenSetOrder($input: [TokenSetOrderUpdateInput]) {
    updateTokenSetOrder(input: $input)
}
`;
