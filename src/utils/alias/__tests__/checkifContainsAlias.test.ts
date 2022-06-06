import { checkIfContainsAlias } from '../checkIfContainsAlias';

const tokenAliasValue = [
  '{size.6}',
  '$color.#450987',
];
const tokenWithOutAlias = '2';

describe('test if the value contains alias', () => {
  it('returns true when token value is an alias', () => {
    tokenAliasValue.forEach((tokenValue) => {
      expect(checkIfContainsAlias(tokenValue)).toBe(true);
    });
  });
  it('returns false when token value is an alias', () => {
    expect(checkIfContainsAlias(tokenWithOutAlias)).toBe(false);
  });
});
