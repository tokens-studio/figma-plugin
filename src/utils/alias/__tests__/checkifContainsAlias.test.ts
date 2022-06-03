import { checkIfContainsAlias } from '../checkIfContainsAlias';

const tokenWithAlias = '{size.6}';
const tokenWithOutAlias = '2';

describe('contain alias test', () => {
  it('ifContainAlias', () => {
    expect(checkIfContainsAlias(tokenWithAlias)).toBe(true);
  });
  it('ifContain no Alias', () => {
    expect(checkIfContainsAlias(tokenWithOutAlias)).toBe(false);
  });
});
