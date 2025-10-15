import { slugify } from './slugify';

describe('slugify', () => {
  it('converts text to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('replaces spaces with hyphens', () => {
    expect(slugify('foo bar baz')).toBe('foo-bar-baz');
  });

  it('removes special characters', () => {
    expect(slugify('Hello@World!')).toBe('helloworld');
  });

  it('handles multiple consecutive spaces', () => {
    expect(slugify('foo   bar')).toBe('foo-bar');
  });

  it('handles multiple consecutive hyphens', () => {
    expect(slugify('foo---bar')).toBe('foo-bar');
  });

  it('trims whitespace from both ends', () => {
    expect(slugify('  hello world  ')).toBe('hello-world');
  });

  it('handles unicode characters', () => {
    expect(slugify('Café')).toBe('cafe');
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('handles numbers', () => {
    expect(slugify('Token 123')).toBe('token-123');
  });

  it('handles underscores', () => {
    expect(slugify('hello_world')).toBe('hello_world');
  });

  it('handles complex mixed input', () => {
    expect(slugify('Token Name! #123 @Special')).toBe('token-name-123-special');
  });
});
