import { checkAndEvaluateMath } from './checkAndEvaluateMath';

describe('checkAndEvaluateMath', () => {
  describe('basic arithmetic', () => {
    it('should evaluate simple addition', () => {
      expect(checkAndEvaluateMath('1 + 2')).toBe(3);
      expect(checkAndEvaluateMath('10 + 20')).toBe(30);
    });

    it('should evaluate simple subtraction', () => {
      expect(checkAndEvaluateMath('5 - 2')).toBe(3);
      expect(checkAndEvaluateMath('100 - 50')).toBe(50);
    });

    it('should evaluate simple multiplication', () => {
      expect(checkAndEvaluateMath('2 * 3')).toBe(6);
      expect(checkAndEvaluateMath('10 * 5')).toBe(50);
    });

    it('should evaluate simple division', () => {
      expect(checkAndEvaluateMath('10 / 2')).toBe(5);
      expect(checkAndEvaluateMath('100 / 4')).toBe(25);
    });
  });

  describe('complex expressions', () => {
    it('should evaluate expressions with multiple operations', () => {
      expect(checkAndEvaluateMath('2 + 3 * 4')).toBe(14);
      expect(checkAndEvaluateMath('(2 + 3) * 4')).toBe(20);
      expect(checkAndEvaluateMath('10 - 2 * 3')).toBe(4);
    });

    it('should handle decimal numbers', () => {
      expect(checkAndEvaluateMath('1.5 + 2.5')).toBe(4);
      expect(checkAndEvaluateMath('10.5 / 2')).toBe(5.25);
    });

    it('should round to 3 decimal places', () => {
      expect(checkAndEvaluateMath('1 / 3')).toBe(0.333);
      expect(checkAndEvaluateMath('2 / 3')).toBe(0.667);
    });
  });

  describe('units', () => {
    it('should preserve units in calculations', () => {
      expect(checkAndEvaluateMath('10px + 5px')).toBe('15px');
      expect(checkAndEvaluateMath('100% - 20%')).toBe('80%');
      expect(checkAndEvaluateMath('2rem * 3')).toBe('6rem');
    });

    it('should handle different CSS units', () => {
      expect(checkAndEvaluateMath('10em + 5em')).toBe('15em');
      expect(checkAndEvaluateMath('100vh / 2')).toBe('50vh');
    });
  });

  describe('custom functions', () => {
    it('should evaluate clamped function', () => {
      expect(checkAndEvaluateMath('clamped(5, 0, 10)')).toBe(5);
      expect(checkAndEvaluateMath('clamped(-5, 0, 10)')).toBe(0);
      expect(checkAndEvaluateMath('clamped(15, 0, 10)')).toBe(10);
    });

    it('should evaluate lerp function', () => {
      expect(checkAndEvaluateMath('lerp(0, 0, 100)')).toBe(0);
      expect(checkAndEvaluateMath('lerp(0.5, 0, 100)')).toBe(50);
      expect(checkAndEvaluateMath('lerp(1, 0, 100)')).toBe(100);
    });

    it('should evaluate norm function', () => {
      expect(checkAndEvaluateMath('norm(50, 0, 100)')).toBe(0.5);
      expect(checkAndEvaluateMath('norm(25, 0, 100)')).toBe(0.25);
      expect(checkAndEvaluateMath('norm(100, 0, 100)')).toBe(1);
    });

    it('should evaluate sample function', () => {
      // sample allows calling another function with arguments
      expect(checkAndEvaluateMath('sample(clamped, 5, 0, 10)')).toBe(5);
    });
  });

  describe('error handling', () => {
    it('should return original string for invalid expressions', () => {
      expect(checkAndEvaluateMath('invalid')).toBe('invalid');
      expect(checkAndEvaluateMath('abc def')).toBe('abc def');
      expect(checkAndEvaluateMath('')).toBe('');
    });

    it('should handle malformed math expressions', () => {
      expect(checkAndEvaluateMath('1 + ')).toBe('1 + ');
      expect(checkAndEvaluateMath('* 5')).toBe('* 5');
    });
  });

  describe('edge cases', () => {
    it('should handle negative numbers', () => {
      expect(checkAndEvaluateMath('-5 + 10')).toBe(5);
      expect(checkAndEvaluateMath('10 + -5')).toBe(5);
    });

    it('should handle zero', () => {
      expect(checkAndEvaluateMath('0 + 0')).toBe(0);
      expect(checkAndEvaluateMath('5 * 0')).toBe(0);
    });

    it('should handle parentheses', () => {
      expect(checkAndEvaluateMath('((1 + 2) * 3)')).toBe(9);
      expect(checkAndEvaluateMath('(10 - (2 * 3))')).toBe(4);
    });
  });
});
