import { retryWithBackoff } from '../retryWithBackoff';

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

  it('does not retry other HttpErrors that have no response', async () => {
    const fn = jest.fn().mockRejectedValue(Object.assign(new Error('Bad credentials'), { name: 'HttpError', status: 401 }));
    await expect(retryWithBackoff(fn, quiet)).rejects.toThrow('Bad credentials');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries server errors and 429s', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(httpError(502, 'Bad Gateway'))
      .mockRejectedValueOnce(httpError(429, 'Too Many Requests'))
      .mockResolvedValueOnce('ok');

    await expect(retryWithBackoff(fn, quiet)).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('does not retry 403s or 404s', async () => {
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
