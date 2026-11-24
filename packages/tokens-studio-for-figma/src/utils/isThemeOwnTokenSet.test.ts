import { isThemeOwnTokenSet } from './isThemeOwnTokenSet';

describe('isThemeOwnTokenSet', () => {
  const theme = { name: 'Light', group: 'Brand Core' };

  it('matches the set of the theme\'s collection and mode', () => {
    expect(isThemeOwnTokenSet('Brand Core/Light', theme)).toBe(true);
    expect(isThemeOwnTokenSet('颜色/Light', { name: 'Light', group: '颜色' })).toBe(true);
    expect(isThemeOwnTokenSet('A/B/Light/Dim', { name: 'Light/Dim', group: 'A/B' })).toBe(true);
  });

  it('matches a group name Tokens Studio changed', () => {
    expect(isThemeOwnTokenSet('Brand Core/Light', { name: 'Light', group: 'Brand-Core' })).toBe(true);
  });

  it('matches the set of an extended collection', () => {
    expect(isThemeOwnTokenSet('Child/Light', { name: 'Light', group: 'Parent/Child', $figmaIsExtension: true })).toBe(true);
    expect(isThemeOwnTokenSet('Child/Light', { name: 'Light', group: 'Parent/Child' })).toBe(false);
  });

  it('does not match other sets', () => {
    expect(isThemeOwnTokenSet('core/base', theme)).toBe(false);
    expect(isThemeOwnTokenSet('semantic/Light', theme)).toBe(false);
    expect(isThemeOwnTokenSet('Brand Core/Dark', theme)).toBe(false);
    expect(isThemeOwnTokenSet('/Light', theme)).toBe(false);
    expect(isThemeOwnTokenSet('颜色/Light', theme)).toBe(false);
    expect(isThemeOwnTokenSet('Brand Core/Light', { name: 'Light' })).toBe(false);
  });
});
