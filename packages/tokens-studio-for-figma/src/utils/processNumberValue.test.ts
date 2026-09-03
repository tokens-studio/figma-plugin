import { processNumberValue } from './processNumberValue';

describe('processNumberValue', () => {
  it('should return number as-is when value is already a number', () => {
    expect(processNumberValue(42)).toBe(42);
    expect(processNumberValue(0)).toBe(0);
    expect(processNumberValue(-3.14)).toBe(-3.14);
    expect(processNumberValue(1.5)).toBe(1.5);
    expect(processNumberValue(-0)).toBe(-0);
  });

  it('should parse valid numeric strings to numbers', () => {
    expect(processNumberValue('42')).toBe(42);
    expect(processNumberValue(' 42 ')).toBe(42);
    expect(processNumberValue('0')).toBe(0);
    expect(processNumberValue('-3.14')).toBe(-3.14);
    expect(processNumberValue('1.5')).toBe(1.5);
    expect(processNumberValue('  -0  ')).toBe(-0);
    expect(processNumberValue('123.456')).toBe(123.456);
  });

  it('should return trimmed string for non-numeric strings', () => {
    expect(processNumberValue('16px')).toBe('16px');
    expect(processNumberValue(' hello ')).toBe('hello');
    expect(processNumberValue('abc')).toBe('abc');
    expect(processNumberValue('  text  ')).toBe('text');
    expect(processNumberValue('auto')).toBe('auto');
  });

  it('should return trimmed string for invalid numbers', () => {
    expect(processNumberValue('NaN')).toBe('NaN');
    expect(processNumberValue('Infinity')).toBe('Infinity');
    expect(processNumberValue('-Infinity')).toBe('-Infinity');
  });

  it('should handle empty strings', () => {
    expect(processNumberValue('')).toBe('');
    expect(processNumberValue('   ')).toBe('');
  });

  it('should handle edge cases with numeric patterns', () => {
    // These should not be converted to numbers due to the regex check
    expect(processNumberValue('1.2.3')).toBe('1.2.3');
    expect(processNumberValue('1e5')).toBe('1e5'); // Scientific notation not supported by regex
    expect(processNumberValue('0x10')).toBe('0x10'); // Hex not supported by regex
    expect(processNumberValue('1.')).toBe('1.'); // Trailing dot without digit after

    // This one actually gets converted because .5 is a valid decimal number
    expect(processNumberValue('.5')).toBe(0.5); // Leading dot with digit - valid decimal
  });

  it('should handle non-string, non-number values', () => {
    expect(processNumberValue(null as any)).toBe(null);
    expect(processNumberValue(undefined as any)).toBe(undefined);
    expect(processNumberValue({} as any)).toEqual({});
    expect(processNumberValue([] as any)).toEqual([]);
  });

  it('should handle decimal numbers correctly', () => {
    expect(processNumberValue('0.5')).toBe(0.5);
    expect(processNumberValue('-0.5')).toBe(-0.5);
    expect(processNumberValue('10.0')).toBe(10.0);
    expect(processNumberValue('  3.14159  ')).toBe(3.14159);
  });

  it('should handle integer strings correctly', () => {
    expect(processNumberValue('100')).toBe(100);
    expect(processNumberValue('-100')).toBe(-100);
    expect(processNumberValue('  999  ')).toBe(999);
  });
});
