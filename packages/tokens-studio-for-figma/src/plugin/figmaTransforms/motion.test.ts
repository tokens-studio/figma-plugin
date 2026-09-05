import { defaultFigmaEasing, timingToSeconds, toFigmaEasing } from './motion';

describe('timingToSeconds', () => {
  it('parses ms strings', () => {
    expect(timingToSeconds('200ms')).toBe(0.2);
    expect(timingToSeconds('0ms')).toBe(0);
    expect(timingToSeconds('1500ms')).toBe(1.5);
  });

  it('parses s strings', () => {
    expect(timingToSeconds('0.2s')).toBe(0.2);
    expect(timingToSeconds('2s')).toBe(2);
  });

  it('accepts whitespace and negative values', () => {
    expect(timingToSeconds('  200ms')).toBe(0.2);
    expect(timingToSeconds('-100ms')).toBe(-0.1);
  });

  it('treats bare numbers as already seconds', () => {
    expect(timingToSeconds(0.2)).toBe(0.2);
    expect(timingToSeconds(1)).toBe(1);
  });

  it('parses the DTCG object form', () => {
    expect(timingToSeconds({ value: 200, unit: 'ms' })).toBe(0.2);
    expect(timingToSeconds({ value: '200', unit: 'ms' })).toBe(0.2);
    expect(timingToSeconds({ value: 0.4, unit: 's' })).toBe(0.4);
  });

  it('returns null for malformed input', () => {
    expect(timingToSeconds('nope')).toBeNull();
    expect(timingToSeconds(null)).toBeNull();
    expect(timingToSeconds(undefined)).toBeNull();
    expect(timingToSeconds({ value: 'x', unit: 'ms' })).toBeNull();
  });
});

describe('toFigmaEasing', () => {
  it('parses 4-tuple arrays', () => {
    expect(toFigmaEasing([0.4, 0, 0.2, 1])).toEqual({
      type: 'CUSTOM_CUBIC_BEZIER',
      easingFunctionCubicBezier: {
        x1: 0.4, y1: 0, x2: 0.2, y2: 1,
      },
    });
  });

  it('parses comma-separated strings', () => {
    expect(toFigmaEasing('0.4, 0, 0.2, 1')).toEqual({
      type: 'CUSTOM_CUBIC_BEZIER',
      easingFunctionCubicBezier: {
        x1: 0.4, y1: 0, x2: 0.2, y2: 1,
      },
    });
  });

  it('parses cubic-bezier() css notation', () => {
    expect(toFigmaEasing('cubic-bezier(0.25, 0.1, 0.25, 1)')).toEqual({
      type: 'CUSTOM_CUBIC_BEZIER',
      easingFunctionCubicBezier: {
        x1: 0.25, y1: 0.1, x2: 0.25, y2: 1,
      },
    });
  });

  it('normalises an already-MotionEasing object', () => {
    const easing = {
      type: 'CUSTOM_CUBIC_BEZIER',
      easingFunctionCubicBezier: {
        x1: 0.42, y1: 0, x2: 0.58, y2: 1,
      },
    };
    expect(toFigmaEasing(easing)).toEqual(easing);
  });

  it('returns null when the array is the wrong length', () => {
    expect(toFigmaEasing([0.4, 0, 0.2])).toBeNull();
  });

  it('returns null when the string does not parse to 4 numbers', () => {
    expect(toFigmaEasing('nope')).toBeNull();
    expect(toFigmaEasing('0.4, 0, 0.2')).toBeNull();
  });

  it('returns null for non-object non-array non-string', () => {
    expect(toFigmaEasing(null)).toBeNull();
    expect(toFigmaEasing(42)).toBeNull();
  });
});

describe('defaultFigmaEasing', () => {
  it('returns linear cubic bezier', () => {
    expect(defaultFigmaEasing()).toEqual({
      type: 'CUSTOM_CUBIC_BEZIER',
      easingFunctionCubicBezier: {
        x1: 0, y1: 0, x2: 1, y2: 1,
      },
    });
  });
});
