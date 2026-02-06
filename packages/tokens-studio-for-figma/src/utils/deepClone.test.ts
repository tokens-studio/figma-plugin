import { deepClone } from './deepClone';

describe('deepClone', () => {
  it('should clone a simple object', () => {
    const obj = { a: 1, b: 'test', c: true };
    const cloned = deepClone(obj);

    expect(cloned).toEqual(obj);
    expect(cloned).not.toBe(obj);
  });

  it('should clone nested objects', () => {
    const obj = {
      a: 1,
      b: {
        c: 2,
        d: {
          e: 3,
        },
      },
    };
    const cloned = deepClone(obj);

    expect(cloned).toEqual(obj);
    expect(cloned).not.toBe(obj);
    expect(cloned.b).not.toBe(obj.b);
    expect(cloned.b.d).not.toBe(obj.b.d);
  });

  it('should clone arrays', () => {
    const arr = [1, 2, 3, { a: 4 }];
    const cloned = deepClone(arr);

    expect(cloned).toEqual(arr);
    expect(cloned).not.toBe(arr);
    expect(cloned[3]).not.toBe(arr[3]);
  });

  it('should clone objects with null values', () => {
    const obj = { a: null, b: undefined };
    const cloned = deepClone(obj);

    expect(cloned.a).toBeNull();
    // Note: JSON.stringify removes undefined values, so this behavior is expected
    expect(cloned.b).toBeUndefined();
  });

  it('should clone complex nested structures', () => {
    const obj = {
      tokens: {
        colors: [
          { name: 'primary', value: '#000000' },
          { name: 'secondary', value: '#ffffff' },
        ],
      },
      metadata: {
        version: '1.0',
        updated: '2024-01-01',
      },
    };
    const cloned = deepClone(obj);

    expect(cloned).toEqual(obj);
    expect(cloned.tokens.colors).not.toBe(obj.tokens.colors);

    // Modify cloned object
    cloned.tokens.colors[0].value = '#ff0000';

    // Original should remain unchanged
    expect(obj.tokens.colors[0].value).toBe('#000000');
  });

  it('should handle empty objects and arrays', () => {
    expect(deepClone({})).toEqual({});
    expect(deepClone([])).toEqual([]);
    expect(deepClone({ a: [] })).toEqual({ a: [] });
  });

  it('should handle special number values', () => {
    const obj = {
      zero: 0,
      negative: -1,
      float: 3.14,
      infinity: Infinity,
      negInfinity: -Infinity,
    };
    const cloned = deepClone(obj);

    expect(cloned.zero).toBe(0);
    expect(cloned.negative).toBe(-1);
    expect(cloned.float).toBe(3.14);
    // Note: JSON doesn't support Infinity
    expect(cloned.infinity).toBeNull();
    expect(cloned.negInfinity).toBeNull();
  });

  it('should throw error for circular references', () => {
    const obj: any = { a: 1 };
    obj.self = obj; // Create circular reference

    expect(() => deepClone(obj)).toThrow('Unable to clone object');
  });

  it('should handle mixed types in arrays', () => {
    const arr = [1, 'string', true, null, { nested: 'object' }, [1, 2, 3]];
    const cloned = deepClone(arr);

    expect(cloned).toEqual(arr);
    expect(cloned[4]).not.toBe(arr[4]);
    expect(cloned[5]).not.toBe(arr[5]);
  });
});
