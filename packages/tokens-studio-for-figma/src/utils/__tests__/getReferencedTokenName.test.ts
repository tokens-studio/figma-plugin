import { getReferencedTokenName } from '../getReferencedTokenName';

describe('getReferencedTokenName', () => {
  it('returns the token name of a pure alias', () => {
    expect(getReferencedTokenName('{border.width.sm}')).toBe('border.width.sm');
    expect(getReferencedTokenName(' {color.red} ')).toBe('color.red');
  });

  it('returns undefined for anything that is not a pure alias', () => {
    expect(getReferencedTokenName('1')).toBeUndefined();
    expect(getReferencedTokenName(1)).toBeUndefined();
    expect(getReferencedTokenName('#f00')).toBeUndefined();
    expect(getReferencedTokenName('{a} * 2')).toBeUndefined();
    expect(getReferencedTokenName('{a}{b}')).toBeUndefined();
    expect(getReferencedTokenName(undefined)).toBeUndefined();
  });
});
