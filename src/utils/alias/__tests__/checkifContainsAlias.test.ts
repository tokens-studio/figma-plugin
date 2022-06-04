import { checkIfContainsAlias } from '../checkIfContainsAlias';

const tokenAliasValue = [
  '{size.6}',
  '$color.#450987',
];
const tokenWithOutAlias = '2';

describe('contain alias test', () => {
  it('ifContainAlias', () => {
    tokenAliasValue.forEach((tokenValue) => {
      expect(checkIfContainsAlias(tokenValue)).toBe(true);
    });
  });
  it('ifContain no Alias', () => {
    expect(checkIfContainsAlias(tokenWithOutAlias)).toBe(false);
  });
});
