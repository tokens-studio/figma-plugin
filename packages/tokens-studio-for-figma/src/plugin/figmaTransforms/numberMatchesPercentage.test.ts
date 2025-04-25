import { numberMatchesPercentage } from './numberMatchesPercentage';

describe('numberMatchesPercentage', () => {
  it('should return true for valid percentage values', () => {
    expect(numberMatchesPercentage('50%')).toBe(true);
    expect(numberMatchesPercentage('100%')).toBe(true);
    expect(numberMatchesPercentage('0%')).toBe(true);
  });

  it('should return false for non-percentage values', () => {
    expect(numberMatchesPercentage('50')).toBe(false);
    expect(numberMatchesPercentage('100')).toBe(false);
    expect(numberMatchesPercentage('0')).toBe(false);
    expect(numberMatchesPercentage('50px')).toBe(false);
    expect(numberMatchesPercentage('abc%')).toBe(false);
  });
});
