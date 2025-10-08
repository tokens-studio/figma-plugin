import IsJSONString from './isJSONString';

describe('IsJSONString', () => {
  it('should return true for valid JSON strings', () => {
    expect(IsJSONString('{}')).toBe(true);
    expect(IsJSONString('[]')).toBe(true);
    expect(IsJSONString('{"key": "value"}')).toBe(true);
    expect(IsJSONString('[1, 2, 3]')).toBe(true);
    expect(IsJSONString('null')).toBe(true);
    expect(IsJSONString('true')).toBe(true);
    expect(IsJSONString('false')).toBe(true);
    expect(IsJSONString('123')).toBe(true);
    expect(IsJSONString('"string"')).toBe(true);
  });

  it('should return true for valid complex JSON', () => {
    const complexJson = JSON.stringify({
      tokens: {
        colors: {
          primary: '#ff0000',
        },
      },
      themes: [],
    });
    expect(IsJSONString(complexJson)).toBe(true);
  });

  it('should return false for invalid JSON strings', () => {
    expect(IsJSONString('')).toBe(false);
    expect(IsJSONString('invalid')).toBe(false);
    expect(IsJSONString('{key: value}')).toBe(false);
    expect(IsJSONString("{'key': 'value'}")).toBe(false);
    expect(IsJSONString('[1, 2, 3,')).toBe(false);
    expect(IsJSONString('undefined')).toBe(false);
  });

  it('should return false for non-JSON strings', () => {
    expect(IsJSONString('hello world')).toBe(false);
    expect(IsJSONString('123abc')).toBe(false);
  });

  it('should handle whitespace', () => {
    expect(IsJSONString('  {}  ')).toBe(true);
    expect(IsJSONString('\n{\n}\n')).toBe(true);
  });
});
