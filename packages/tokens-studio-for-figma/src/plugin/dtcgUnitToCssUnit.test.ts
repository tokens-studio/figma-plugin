import { dtcgUnitToCssUnit } from './dtcgUnitToCssUnit';

describe('dtcgUnitToCssUnit', () => {
  it('converts PIXELS to px', () => {
    expect(dtcgUnitToCssUnit('PIXELS')).toBe('px');
  });

  it('converts PERCENT to %', () => {
    expect(dtcgUnitToCssUnit('PERCENT')).toBe('%');
  });

  it('passes through arbitrary string units unchanged', () => {
    expect(dtcgUnitToCssUnit('em')).toBe('em');
    expect(dtcgUnitToCssUnit('rem')).toBe('rem');
    expect(dtcgUnitToCssUnit('px')).toBe('px');
  });

  it('returns empty string for non-string values', () => {
    expect(dtcgUnitToCssUnit(undefined)).toBe('');
    expect(dtcgUnitToCssUnit(null)).toBe('');
    expect(dtcgUnitToCssUnit(42)).toBe('');
    expect(dtcgUnitToCssUnit({})).toBe('');
  });
});
