import { formatNumber } from './formatNumber';

describe('formatNumber', () => {
  it('should format numbers under 1000 as strings', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(1)).toBe('1');
    expect(formatNumber(10)).toBe('10');
    expect(formatNumber(100)).toBe('100');
    expect(formatNumber(999)).toBe('999');
  });

  it('should format numbers 1000 and above with k suffix', () => {
    expect(formatNumber(1000)).toBe('1.0k');
    expect(formatNumber(1500)).toBe('1.5k');
    expect(formatNumber(2000)).toBe('2.0k');
    expect(formatNumber(10000)).toBe('10.0k');
    expect(formatNumber(99999)).toBe('100.0k');
  });

  it('should round to one decimal place', () => {
    expect(formatNumber(1234)).toBe('1.2k');
    expect(formatNumber(1567)).toBe('1.6k');
    expect(formatNumber(12345)).toBe('12.3k');
  });

  it('should handle edge cases', () => {
    expect(formatNumber(999.99)).toBe('999.99');
    expect(formatNumber(1000.0)).toBe('1.0k');
  });
});
