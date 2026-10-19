export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  backoffMultiplier?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: any, attempt: number) => boolean;
  onRetry?: (error: any, attempt: number, maxRetries: number, delayMs: number) => void;
}

const getResponseHeader = (error: any, name: string): string | undefined => {
  const headers = error?.response?.headers;
  if (!headers) return undefined;
  const value = typeof headers.get === 'function' ? headers.get(name) : headers[name];
  return value == null ? undefined : String(value);
};

// GitHub answers both its primary and secondary rate limits with a 403 instead of a 429
export const isRateLimitError = (error: any): boolean => {
  const status = error?.response?.status;
  if (status === 429) return true;
  if (status !== 403) return false;
  return getResponseHeader(error, 'x-ratelimit-remaining') === '0'
    || getResponseHeader(error, 'retry-after') !== undefined
    || /rate limit/i.test(error?.message ?? '');
};

// How long the server asked us to wait before retrying, or undefined if it did not say
export const getRetryAfterMs = (error: any, now = Date.now()): number | undefined => {
  const retryAfter = getResponseHeader(error, 'retry-after');
  if (retryAfter !== undefined) {
    const seconds = Number(retryAfter);
    if (!Number.isNaN(seconds)) return Math.max(0, seconds * 1000);
    const date = Date.parse(retryAfter);
    if (!Number.isNaN(date)) return Math.max(0, date - now);
  }
  if (getResponseHeader(error, 'x-ratelimit-remaining') === '0') {
    const reset = Number(getResponseHeader(error, 'x-ratelimit-reset'));
    if (!Number.isNaN(reset) && reset > 0) return Math.max(0, reset * 1000 - now);
  }
  return undefined;
};

const defaultShouldRetry = (error: any, _attempt: number): boolean => {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }

  // Octokit turns a failed fetch (CORS failure, dropped connection, proxy reset) into an
  // HttpError with status 500 and no response
  if (error?.name === 'HttpError' && !error.response) {
    return true;
  }

  if (error.response) {
    const { status } = error.response;
    return status >= 500 || status === 429 || status === 408 || isRateLimitError(error);
  }

  if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    return true;
  }

  return false;
};

const defaultOnRetry = (error: any, attempt: number, maxRetries: number, delayMs: number): void => {
  // eslint-disable-next-line no-console
  console.log(`Retry attempt ${attempt}/${maxRetries} after ${delayMs}ms delay. Error:`, error.message || error);
};

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 100,
    backoffMultiplier = 2,
    maxDelayMs = 30000,
    shouldRetry = defaultShouldRetry,
    onRetry = defaultOnRetry,
  } = options;

  let lastError: any;
  let delayMs = initialDelayMs;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        break;
      }

      if (!shouldRetry(error, attempt)) {
        throw error;
      }

      // Wait at least as long as the server asked. If that is longer than we are willing to
      // wait (e.g. GitHub's hourly limit), fail now instead of hanging the UI.
      const retryAfterMs = getRetryAfterMs(error);
      if (retryAfterMs !== undefined && retryAfterMs > maxDelayMs) {
        break;
      }
      const currentDelay = Math.min(Math.max(delayMs, retryAfterMs ?? 0), maxDelayMs);

      onRetry(error, attempt, maxRetries, currentDelay);

      await new Promise((resolve) => {
        setTimeout(resolve, currentDelay);
      });

      delayMs *= backoffMultiplier;
    }
  }

  throw lastError;
}

export async function retryHttpRequest<T>(
  requestFn: () => Promise<T>,
  options: Omit<RetryOptions, 'shouldRetry'> & {
    retryStatusCodes?: number[];
  } = {},
): Promise<T> {
  const { retryStatusCodes = [], ...retryOptions } = options;

  return retryWithBackoff(requestFn, {
    ...retryOptions,
    shouldRetry: (error: any, attempt: number) => {
      if (defaultShouldRetry(error, attempt)) {
        return true;
      }

      if (error.response && retryStatusCodes.includes(error.response.status)) {
        return true;
      }

      return false;
    },
  });
}
