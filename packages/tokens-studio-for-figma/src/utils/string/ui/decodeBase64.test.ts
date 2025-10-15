import { decodeBase64 } from './decodeBase64';

describe('decodeBase64', () => {
  it('decodes simple base64 string', () => {
    const base64 = btoa('hello world');
    expect(decodeBase64(base64)).toBe('hello world');
  });

  it('decodes base64 with special characters', () => {
    const text = 'Hello! @#$%^&*()';
    const base64 = btoa(text);
    expect(decodeBase64(base64)).toBe(text);
  });

  it('decodes base64 with numbers', () => {
    const text = '1234567890';
    const base64 = btoa(text);
    expect(decodeBase64(base64)).toBe(text);
  });

  it('decodes base64 with newlines', () => {
    const text = 'line1\nline2\nline3';
    const base64 = btoa(text);
    expect(decodeBase64(base64)).toBe(text);
  });

  it('decodes JSON object encoded in base64', () => {
    const json = JSON.stringify({ key: 'value', number: 123 });
    const base64 = btoa(json);
    expect(decodeBase64(base64)).toBe(json);
  });

  it('decodes empty string', () => {
    const base64 = btoa('');
    expect(decodeBase64(base64)).toBe('');
  });

  it('decodes base64 with spaces', () => {
    const text = 'hello   world   test';
    const base64 = btoa(text);
    expect(decodeBase64(base64)).toBe(text);
  });
});
