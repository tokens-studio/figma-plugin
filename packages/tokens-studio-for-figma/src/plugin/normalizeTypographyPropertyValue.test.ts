import { normalizeTypographyPropertyValue } from './normalizeTypographyPropertyValue';

describe('normalizeTypographyPropertyValue', () => {
  describe('DTCG dimension objects', () => {
    it('converts { value, unit } objects to CSS strings', () => {
      expect(normalizeTypographyPropertyValue('fontSize', { value: 24, unit: 'px' })).toBe('24px');
      expect(normalizeTypographyPropertyValue('lineHeight', { value: 150, unit: '%' })).toBe('150%');
    });

    it('handles DTCG enum units (PIXELS, PERCENT)', () => {
      expect(normalizeTypographyPropertyValue('fontSize', { value: 16, unit: 'PIXELS' })).toBe('16px');
      expect(normalizeTypographyPropertyValue('lineHeight', { value: 120, unit: 'PERCENT' })).toBe('120%');
    });

    it('handles dimension objects with no unit', () => {
      expect(normalizeTypographyPropertyValue('fontSize', { value: 16 })).toBe('16');
    });
  });

  describe('JSON-array font families', () => {
    it('converts JSON array string to comma-separated font family for fontFamily key', () => {
      expect(normalizeTypographyPropertyValue('fontFamily', '["Comic","Sans","MS"]')).toBe('Comic, Sans, MS');
    });

    it('converts JSON array string to comma-separated font family for fontFamilies key', () => {
      expect(normalizeTypographyPropertyValue('fontFamilies', '["Inter","system-ui"]')).toBe('Inter, system-ui');
    });

    it('leaves plain font family strings unchanged', () => {
      expect(normalizeTypographyPropertyValue('fontFamily', 'Inter')).toBe('Inter');
    });

    it('does not parse JSON arrays for non-fontFamily keys', () => {
      const value = '["not","a","font"]';
      expect(normalizeTypographyPropertyValue('fontSize', value)).toBe(value);
    });
  });

  describe('passthrough', () => {
    it('returns plain strings unchanged', () => {
      expect(normalizeTypographyPropertyValue('fontWeight', 'Bold')).toBe('Bold');
      expect(normalizeTypographyPropertyValue('fontSize', '16px')).toBe('16px');
    });

    it('returns numbers unchanged', () => {
      expect(normalizeTypographyPropertyValue('fontSize', 16)).toBe(16);
    });

    it('returns undefined unchanged', () => {
      expect(normalizeTypographyPropertyValue('fontSize', undefined)).toBeUndefined();
    });
  });
});
