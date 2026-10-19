import { getRetryAfterMs, isRateLimitError, retryWithBackoff } from '../retryWithBackoff';

// Mirrors @octokit/request-error: a failed fetch becomes an HttpError with status 500 and no response
const networkError = () => Object.assign(new Error('Failed to fetch'), { name: 'HttpError', status: 500 });

const httpError = (status: number, message: string, headers: Record<string, string> = {}) => (
  Object.assign(new Error(message), {
    name: 'HttpError',
    status,
    response: {
      status, url: 'https://api.github.com/repos/o/r/contents/a.json', headers, data: {},
    },
  })
);

const quiet = { onRetry: jest.fn(), initialDelayMs: 1 };

describe('retryWithBackoff', () => {
  it('retries octokit network errors (failed fetch, no response) and then succeeds', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(networkError())
      .mockResolvedValueOnce('ok');

    await expect(retryWithBackoff(fn, quiet)).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('retries server errors and 429s', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(httpError(502, 'Bad Gateway'))
      .mockRejectedValueOnce(httpError(429, 'Too Many Requests'))
      .mockResolvedValueOnce('ok');

    await expect(retryWithBackoff(fn, quiet)).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('retries a GitHub secondary rate limit 403 and waits for retry-after', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(httpError(403, 'You have exceeded a secondary rate limit', { 'retry-after': '0.05' }))
      .mockResolvedValueOnce('ok');
    const onRetry = jest.fn();

    const startedAt = Date.now();
    await expect(retryWithBackoff(fn, { initialDelayMs: 1, onRetry })).resolves.toBe('ok');

    expect(fn).toHaveBeenCalledTimes(2);
    expect(onRetry).toHaveBeenCalledWith(expect.anything(), 1, 3, 50);
    expect(Date.now() - startedAt).toBeGreaterThanOrEqual(45);
  });

  it('gives up immediately when the server asks to wait longer than maxDelayMs', async () => {
    const error = httpError(403, 'API rate limit exceeded', { 'retry-after': '3600' });
    const fn = jest.fn().mockRejectedValue(error);

    await expect(retryWithBackoff(fn, { ...quiet, maxDelayMs: 1000 })).rejects.toBe(error);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does not retry plain permission 403s or 404s', async () => {
    const forbidden = jest.fn().mockRejectedValue(httpError(403, 'Resource not accessible by personal access token'));
    await expect(retryWithBackoff(forbidden, quiet)).rejects.toThrow('Resource not accessible');
    expect(forbidden).toHaveBeenCalledTimes(1);

    const notFound = jest.fn().mockRejectedValue(httpError(404, 'Not Found'));
    await expect(retryWithBackoff(notFound, quiet)).rejects.toThrow('Not Found');
    expect(notFound).toHaveBeenCalledTimes(1);
  });

  it('makes at most maxRetries attempts in total', async () => {
    const fn = jest.fn().mockRejectedValue(networkError());
    await expect(retryWithBackoff(fn, { ...quiet, maxRetries: 3 })).rejects.toThrow('Failed to fetch');
    expect(fn).toHaveBeenCalledTimes(3);
  });
});

describe('isRateLimitError', () => {
  it('detects 429s and GitHub rate limit 403s', () => {
    expect(isRateLimitError(httpError(429, 'Too Many Requests'))).toBe(true);
    expect(isRateLimitError(httpError(403, 'API rate limit exceeded for user ID 1.'))).toBe(true);
    expect(isRateLimitError(httpError(403, 'Forbidden', { 'x-ratelimit-remaining': '0' }))).toBe(true);
    expect(isRateLimitError(httpError(403, 'Forbidden', { 'retry-after': '60' }))).toBe(true);
  });

  it('ignores other errors', () => {
    expect(isRateLimitError(httpError(403, 'Forbidden', { 'x-ratelimit-remaining': '4999' }))).toBe(false);
    expect(isRateLimitError(httpError(401, 'Bad credentials'))).toBe(false);
    expect(isRateLimitError(networkError())).toBe(false);
  });
});

describe('getRetryAfterMs', () => {
  const now = 1_700_000_000_000;

  it('reads retry-after in seconds or as an HTTP date', () => {
    expect(getRetryAfterMs(httpError(403, 'x', { 'retry-after': '60' }), now)).toBe(60000);
    expect(getRetryAfterMs(httpError(403, 'x', { 'retry-after': new Date(now + 5000).toUTCString() }), now)).toBe(5000);
  });

  it('falls back to x-ratelimit-reset when the limit is exhausted', () => {
    const reset = String((now + 90_000) / 1000);
    expect(getRetryAfterMs(httpError(403, 'x', { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': reset }), now)).toBe(90000);
  });

  it('returns undefined when the server gives no hint', () => {
    expect(getRetryAfterMs(httpError(500, 'x'), now)).toBeUndefined();
    expect(getRetryAfterMs(networkError(), now)).toBeUndefined();
  });
});
