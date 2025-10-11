export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  backoffMultiplier?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: any, attempt: number) => boolean;
  onRetry?: (error: any, attempt: number, maxRetries: number, delayMs: number) => void;
}

const defaultShouldRetry = (error: any, _attempt: number): boolean => {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }

  if (error.response) {
    const { status } = error.response;
    return status >= 500 || status === 429 || status === 408 || status === 502 || status === 503 || status === 504;
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

      onRetry(error, attempt, maxRetries, delayMs);

      const currentDelay = Math.min(delayMs, maxDelayMs);
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
