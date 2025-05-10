import { formatCount } from '../formatCount';

describe('formatCount', () => {
  it('returns the number as a string for numbers less than 1000', () => {
    expect(formatCount(0)).toBe('0');
    expect(formatCount(1)).toBe('1');
    expect(formatCount(999)).toBe('999');
  });

  it('returns "1k" for exactly 1000', () => {
    expect(formatCount(1000)).toBe('1k');
  });

  it('returns "1k" for numbers between 1000 and 1100', () => {
    expect(formatCount(1001)).toBe('1k');
    expect(formatCount(1050)).toBe('1k');
    expect(formatCount(1099)).toBe('1k');
  });

  it('returns number with "k" suffix and one decimal place for numbers over 1100', () => {
    expect(formatCount(1100)).toBe('1.1k');
    expect(formatCount(1234)).toBe('1.2k');
    expect(formatCount(1500)).toBe('1.5k');
    expect(formatCount(1999)).toBe('2.0k');
  });

  it('returns number with "k" suffix without decimal for exact multiples of 1000', () => {
    expect(formatCount(2000)).toBe('2k');
    expect(formatCount(3000)).toBe('3k');
    expect(formatCount(10000)).toBe('10k');
  });
});
