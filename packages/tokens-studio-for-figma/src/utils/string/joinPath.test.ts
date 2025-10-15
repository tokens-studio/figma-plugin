import { joinPath } from './joinPath';

describe('joinPath', () => {
  it('joins multiple path segments', () => {
    expect(joinPath('foo', 'bar', 'baz')).toBe('foo/bar/baz');
  });

  it('removes leading slashes from segments', () => {
    expect(joinPath('/foo', '/bar', '/baz')).toBe('foo/bar/baz');
  });

  it('removes trailing slashes from segments', () => {
    expect(joinPath('foo/', 'bar/', 'baz/')).toBe('foo/bar/baz');
  });

  it('handles segments with both leading and trailing slashes', () => {
    expect(joinPath('/foo/', '/bar/', '/baz/')).toBe('foo/bar/baz');
  });

  it('handles empty strings and filters them out', () => {
    expect(joinPath('foo', '', 'bar')).toBe('foo/bar');
  });

  it('handles null and undefined values', () => {
    expect(joinPath('foo', null as any, 'bar', undefined as any, 'baz')).toBe('foo/bar/baz');
  });

  it('handles single path segment', () => {
    expect(joinPath('foo')).toBe('foo');
  });

  it('handles all empty segments', () => {
    expect(joinPath('', '', '')).toBe('');
  });

  it('handles path with multiple consecutive slashes', () => {
    expect(joinPath('///foo///', '///bar///')).toBe('foo/bar');
  });

  it('handles mixed path separators', () => {
    expect(joinPath('/api/', '/users/', '/123')).toBe('api/users/123');
  });
});
