import { normalizeVariableName } from './normalizeVariableName';

describe('normalizeVariableName', () => {
  it('should convert slash-separated names to dot-separated', () => {
    expect(normalizeVariableName('colors/primary')).toBe('colors.primary');
    expect(normalizeVariableName('spacing/sm')).toBe('spacing.sm');
  });

  it('should handle multiple levels of hierarchy', () => {
    expect(normalizeVariableName('colors/brand/primary')).toBe('colors.brand.primary');
    expect(normalizeVariableName('spacing/layout/vertical/large')).toBe('spacing.layout.vertical.large');
  });

  it('should trim whitespace from parts', () => {
    expect(normalizeVariableName('colors / primary')).toBe('colors.primary');
    expect(normalizeVariableName(' spacing / sm ')).toBe('spacing.sm');
    expect(normalizeVariableName('colors  /  brand  /  primary')).toBe('colors.brand.primary');
  });

  it('should handle names without slashes', () => {
    expect(normalizeVariableName('primary')).toBe('primary');
    expect(normalizeVariableName('color')).toBe('color');
  });

  it('should handle empty strings', () => {
    expect(normalizeVariableName('')).toBe('');
  });

  it('should handle trailing and leading slashes', () => {
    expect(normalizeVariableName('/colors/primary')).toBe('.colors.primary');
    expect(normalizeVariableName('colors/primary/')).toBe('colors.primary.');
    expect(normalizeVariableName('/colors/primary/')).toBe('.colors.primary.');
  });

  it('should handle consecutive slashes', () => {
    expect(normalizeVariableName('colors//primary')).toBe('colors..primary');
    expect(normalizeVariableName('a///b')).toBe('a...b');
  });

  it('should preserve special characters in names', () => {
    expect(normalizeVariableName('colors-dark/primary-500')).toBe('colors-dark.primary-500');
    expect(normalizeVariableName('spacing_sm/value_1')).toBe('spacing_sm.value_1');
  });
});
