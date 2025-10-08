import { isEqual } from './isEqual';

describe('isEqual', () => {
  describe('primitives', () => {
    it('should return true for equal primitives', () => {
      expect(isEqual(1, 1)).toBe(true);
      expect(isEqual('test', 'test')).toBe(true);
      expect(isEqual(true, true)).toBe(true);
      expect(isEqual(null, null)).toBe(true);
      expect(isEqual(undefined, undefined)).toBe(true);
    });

    it('should return false for different primitives', () => {
      expect(isEqual(1, 2)).toBe(false);
      expect(isEqual('test', 'test2')).toBe(false);
      expect(isEqual(true, false)).toBe(false);
      expect(isEqual(null, undefined)).toBe(false);
    });

    it('should return true for NaN values', () => {
      expect(isEqual(NaN, NaN)).toBe(true);
    });
  });

  describe('arrays', () => {
    it('should return true for equal arrays', () => {
      expect(isEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(isEqual(['a', 'b'], ['a', 'b'])).toBe(true);
      expect(isEqual([], [])).toBe(true);
    });

    it('should return false for different arrays', () => {
      expect(isEqual([1, 2, 3], [1, 2, 4])).toBe(false);
      expect(isEqual([1, 2], [1, 2, 3])).toBe(false);
      expect(isEqual(['a'], ['b'])).toBe(false);
    });

    it('should handle nested arrays', () => {
      expect(isEqual([1, [2, 3]], [1, [2, 3]])).toBe(true);
      expect(isEqual([1, [2, 3]], [1, [2, 4]])).toBe(false);
    });
  });

  describe('objects', () => {
    it('should return true for equal objects', () => {
      expect(isEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
      expect(isEqual({}, {})).toBe(true);
    });

    it('should return false for different objects', () => {
      expect(isEqual({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
      expect(isEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    });

    it('should check key order for objects', () => {
      expect(isEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(false);
    });

    it('should handle nested objects', () => {
      expect(isEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
      expect(isEqual({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false);
    });

    it('should handle mixed nested structures', () => {
      const obj1 = { a: [1, { b: 2 }], c: { d: [3, 4] } };
      const obj2 = { a: [1, { b: 2 }], c: { d: [3, 4] } };
      const obj3 = { a: [1, { b: 2 }], c: { d: [3, 5] } };

      expect(isEqual(obj1, obj2)).toBe(true);
      expect(isEqual(obj1, obj3)).toBe(false);
    });
  });

  describe('Sets', () => {
    it('should return true for equal Sets', () => {
      expect(isEqual(new Set([1, 2, 3]), new Set([1, 2, 3]))).toBe(true);
      expect(isEqual(new Set(['a', 'b']), new Set(['a', 'b']))).toBe(true);
    });

    it('should return false for different Sets', () => {
      expect(isEqual(new Set([1, 2, 3]), new Set([1, 2, 4]))).toBe(false);
      expect(isEqual(new Set([1, 2]), new Set([1, 2, 3]))).toBe(false);
    });
  });

  describe('native subtypes', () => {
    it('should compare Dates', () => {
      const date1 = new Date('2023-01-01');
      const date2 = new Date('2023-01-01');
      const date3 = new Date('2023-01-02');

      expect(isEqual(date1, date2)).toBe(true);
      expect(isEqual(date1, date3)).toBe(false);
    });

    it('should compare RegExp', () => {
      expect(isEqual(/test/, /test/)).toBe(true);
      expect(isEqual(/test/i, /test/i)).toBe(true);
      expect(isEqual(/test/, /test2/)).toBe(false);
      expect(isEqual(/test/i, /test/)).toBe(false);
    });

    it('should compare Functions', () => {
      const fn1 = () => 'test';
      const fn2 = () => 'test';
      const fn3 = () => 'test2';

      expect(isEqual(fn1, fn1)).toBe(true);
      expect(isEqual(fn1, fn2)).toBe(true);
      expect(isEqual(fn1, fn3)).toBe(false);
    });
  });

  describe('type mismatches', () => {
    it('should return false for different types', () => {
      expect(isEqual(1, '1')).toBe(false);
      expect(isEqual([], {})).toBe(false);
      expect(isEqual(null, {})).toBe(false);
      expect(isEqual(undefined, null)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle same reference', () => {
      const obj = { a: 1 };
      expect(isEqual(obj, obj)).toBe(true);
    });

    it('should handle null and undefined', () => {
      expect(isEqual(null, null)).toBe(true);
      expect(isEqual(undefined, undefined)).toBe(true);
      expect(isEqual(null, undefined)).toBe(false);
    });

    it('should handle empty values', () => {
      expect(isEqual('', '')).toBe(true);
      expect(isEqual(0, 0)).toBe(true);
      expect(isEqual(false, false)).toBe(true);
    });
  });
});
