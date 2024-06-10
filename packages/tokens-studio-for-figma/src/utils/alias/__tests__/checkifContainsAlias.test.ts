import { checkIfContainsAlias } from '../checkIfContainsAlias';

const tokenAliasValue = [
  '{size.6}',
  '$color.#450987',
  'rgba({size.2}, 0.5)',
  'linear-gradient(90deg, {colors.primary} 0%, {colors.secondary} 100%)',
  '{colors.primary}',
  '{sizing.small} * {sizing.base}',
  '2 * {sizing.base}',
  '{sizing.small} * 2',
];
const tokenWithOutAlias = [
  '2',
  'spacing',
  'linear-gradient(90deg #ff0000 0%, #ff0000 100%)',
  'rgba(255, 0, 0, 0.5)',
  '90 * 2 * 1.5',
];

describe('test if the value contains alias', () => {
  it('returns true when token value is an alias', () => {
    tokenAliasValue.forEach((tokenValue) => {
      expect(checkIfContainsAlias(tokenValue)).toBe(true);
    });
  });
  it('returns false when token value is not an alias', () => {
    tokenWithOutAlias.forEach((tokenValue) => {
      expect(checkIfContainsAlias(tokenValue)).toBe(false);
    });
  });
});
