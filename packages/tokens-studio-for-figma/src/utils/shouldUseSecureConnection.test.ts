import { shouldUseSecureConnection } from './shouldUseSecureConnection';

describe('shouldUseSecureConnection', () => {
  const originalEnv = process.env.ENVIRONMENT;

  afterEach(() => {
    process.env.ENVIRONMENT = originalEnv;
  });

  it('returns true in production environment', () => {
    process.env.ENVIRONMENT = 'production';
    expect(shouldUseSecureConnection()).toBe(true);
  });

  it('returns false in development environment with no baseUrl or host', () => {
    process.env.ENVIRONMENT = 'development';
    expect(shouldUseSecureConnection()).toBe(false);
  });

  it('returns false in development environment with localhost host', () => {
    process.env.ENVIRONMENT = 'development';
    expect(shouldUseSecureConnection('http://example.com', 'localhost')).toBe(false);
  });

  it('returns false in development environment with localhost in host', () => {
    process.env.ENVIRONMENT = 'development';
    expect(shouldUseSecureConnection('http://example.com', 'http://localhost:3000')).toBe(false);
  });

  it('returns true in development environment with external host', () => {
    process.env.ENVIRONMENT = 'development';
    expect(shouldUseSecureConnection('http://example.com', 'https://api.example.com')).toBe(true);
  });

  it('returns false when baseUrl is empty string', () => {
    process.env.ENVIRONMENT = 'development';
    expect(shouldUseSecureConnection('', 'https://api.example.com')).toBe(false);
  });

  it('returns false when baseUrl is only whitespace', () => {
    process.env.ENVIRONMENT = 'development';
    expect(shouldUseSecureConnection('   ', 'https://api.example.com')).toBe(false);
  });

  it('returns true when baseUrl and host are both provided and not localhost', () => {
    process.env.ENVIRONMENT = 'development';
    expect(shouldUseSecureConnection('https://studio.example.com', 'https://api.example.com')).toBe(true);
  });

  it('returns true in non-development environment regardless of params', () => {
    process.env.ENVIRONMENT = 'staging';
    expect(shouldUseSecureConnection('', 'localhost')).toBe(true);
  });
});
