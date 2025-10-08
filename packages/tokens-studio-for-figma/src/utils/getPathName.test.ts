import { getPathName } from './getPathName';

describe('getPathName', () => {
  describe('references with curly braces', () => {
    it('should extract path from reference wrapped in curly braces', () => {
      expect(getPathName('{colors.primary}')).toBe('colors.primary');
      expect(getPathName('{spacing.sm}')).toBe('spacing.sm');
    });

    it('should handle nested paths', () => {
      expect(getPathName('{colors.brand.primary}')).toBe('colors.brand.primary');
      expect(getPathName('{typography.heading.large.fontFamily}')).toBe('typography.heading.large.fontFamily');
    });

    it('should handle single character names', () => {
      expect(getPathName('{a}')).toBe('a');
      expect(getPathName('{x}')).toBe('x');
    });
  });

  describe('references starting with $', () => {
    it('should strip leading $ from reference', () => {
      expect(getPathName('$colors.primary')).toBe('colors.primary');
      expect(getPathName('$spacing.sm')).toBe('spacing.sm');
    });

    it('should handle nested paths starting with $', () => {
      expect(getPathName('$colors.brand.primary')).toBe('colors.brand.primary');
      expect(getPathName('$typography.heading.large')).toBe('typography.heading.large');
    });

    it('should handle single character names', () => {
      expect(getPathName('$a')).toBe('a');
      expect(getPathName('$x')).toBe('x');
    });
  });

  describe('edge cases', () => {
    it('should handle references with special characters', () => {
      expect(getPathName('{colors-primary}')).toBe('colors-primary');
      expect(getPathName('{spacing_sm}')).toBe('spacing_sm');
      expect(getPathName('$color-primary')).toBe('color-primary');
    });

    it('should handle empty braces', () => {
      expect(getPathName('{}')).toBe('');
    });

    it('should prioritize curly brace format over $ format', () => {
      // If it starts with {, it uses curly brace logic
      expect(getPathName('{$colors.primary}')).toBe('$colors.primary');
    });
  });
});
