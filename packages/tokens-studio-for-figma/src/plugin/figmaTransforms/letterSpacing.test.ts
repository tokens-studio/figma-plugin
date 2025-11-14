import { convertLetterSpacingToFigma, convertFigmaToLetterSpacing } from './letterSpacing';

describe('letterSpacing', () => {
  describe('convertLetterSpacingToFigma', () => {
    it('should convert "0" to Figma letterSpacing object', () => {
      const result = convertLetterSpacingToFigma('0', '16');
      expect(result).toEqual({
        unit: 'PIXELS',
        value: 0,
      });
    });

    it('should convert "0%" to Figma letterSpacing object', () => {
      const result = convertLetterSpacingToFigma('0%', '16');
      expect(result).toEqual({
        unit: 'PERCENT',
        value: 0,
      });
    });

    it('should convert "none" to 0 (fixing the bug where 0 becomes none)', () => {
      const result = convertLetterSpacingToFigma('none', '16');
      expect(result).toEqual({
        unit: 'PIXELS',
        value: 0,
      });
    });

    it('should convert "NONE" (uppercase) to 0', () => {
      const result = convertLetterSpacingToFigma('NONE', '16');
      expect(result).toEqual({
        unit: 'PIXELS',
        value: 0,
      });
    });

    it('should convert string "0" (edge case) to Figma letterSpacing object', () => {
      // Testing with just "0" as a string to ensure it's properly handled
      const result = convertLetterSpacingToFigma('0', '16');
      expect(result).toEqual({
        unit: 'PIXELS',
        value: 0,
      });
    });
  });

  describe('convertFigmaToLetterSpacing', () => {
    it('should convert Figma letterSpacing with PIXELS unit and value 0 to number 0', () => {
      const result = convertFigmaToLetterSpacing({ unit: 'PIXELS', value: 0 });
      expect(result).toBe(0);
    });

    it('should convert Figma letterSpacing with PERCENT unit and value 0 to "0%"', () => {
      const result = convertFigmaToLetterSpacing({ unit: 'PERCENT', value: 0 });
      expect(result).toBe('0%');
    });
  });
});
