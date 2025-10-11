import { isColorApproximatelyEqual } from './isColorApproximatelyEqual';

describe('isColorApproximatelyEqual', () => {
  it('should return true for identical colors', () => {
    const color1 = {
      r: 0.5, g: 0.6, b: 0.7, a: 0.8,
    };
    const color2 = {
      r: 0.5, g: 0.6, b: 0.7, a: 0.8,
    };

    expect(isColorApproximatelyEqual(color1, color2)).toBe(true);
  });

  it('should return true for colors within default threshold', () => {
    const color1 = {
      r: 0.5, g: 0.6, b: 0.7, a: 0.8,
    };
    const color2 = {
      r: 0.50005, g: 0.60005, b: 0.70005, a: 0.80005,
    };

    expect(isColorApproximatelyEqual(color1, color2)).toBe(true);
  });

  it('should return false for colors outside default threshold', () => {
    const color1 = {
      r: 0.5, g: 0.6, b: 0.7, a: 0.8,
    };
    const color2 = {
      r: 0.51, g: 0.6, b: 0.7, a: 0.8,
    };

    expect(isColorApproximatelyEqual(color1, color2)).toBe(false);
  });

  it('should return true for colors within custom threshold', () => {
    const color1 = {
      r: 0.5, g: 0.6, b: 0.7, a: 0.8,
    };
    const color2 = {
      r: 0.505, g: 0.605, b: 0.705, a: 0.805,
    };

    expect(isColorApproximatelyEqual(color1, color2, 0.01)).toBe(true);
  });

  it('should return false for colors outside custom threshold', () => {
    const color1 = {
      r: 0.5, g: 0.6, b: 0.7, a: 0.8,
    };
    const color2 = {
      r: 0.52, g: 0.6, b: 0.7, a: 0.8,
    };

    expect(isColorApproximatelyEqual(color1, color2, 0.01)).toBe(false);
  });

  it('should handle edge cases with 0 and 1 values', () => {
    const color1 = {
      r: 0, g: 1, b: 0.5, a: 1,
    };
    const color2 = {
      r: 0.00005, g: 0.99995, b: 0.50005, a: 0.99995,
    };

    expect(isColorApproximatelyEqual(color1, color2)).toBe(true);
  });

  it('should handle cases where only one channel differs significantly', () => {
    const color1 = {
      r: 0.5, g: 0.6, b: 0.7, a: 0.8,
    };
    const color2 = {
      r: 0.9, g: 0.6, b: 0.7, a: 0.8,
    }; // Only red differs significantly

    expect(isColorApproximatelyEqual(color1, color2)).toBe(false);
  });

  it('should handle very small threshold values', () => {
    const color1 = {
      r: 0.123456, g: 0.234567, b: 0.345678, a: 0.456789,
    };
    const color2 = {
      r: 0.123457, g: 0.234567, b: 0.345678, a: 0.456789,
    };

    expect(isColorApproximatelyEqual(color1, color2, 0.000001)).toBe(false);
    expect(isColorApproximatelyEqual(color1, color2, 0.00001)).toBe(true);
  });

  it('should handle negative differences correctly', () => {
    const color1 = {
      r: 0.6, g: 0.7, b: 0.8, a: 0.9,
    };
    const color2 = {
      r: 0.59995, g: 0.69995, b: 0.79995, a: 0.89995,
    };

    expect(isColorApproximatelyEqual(color1, color2)).toBe(true);
  });
});
