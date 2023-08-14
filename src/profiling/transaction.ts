import { startTransaction, getCurrentHub, Transaction } from '@sentry/browser';

/**
 * The status of an Span. {@see Span.setStatus}
 */
const OK = 'ok';
const UNKNOWN_ERROR = 'unknown_error';

const shouldProfile = () => {
  switch (process.env.ENVIRONMENT) {
    case 'production':
    case 'beta':
      return !!process.env.SENTRY_DSN;
    default:
      return false;
  }
};

interface TransactionOptions<U> {
  name: string;
  /**
   * Optional string that will be used as transaction's description.
   */
  description?: string;
  /**
   * An optional stat extractor that will be called with the result of the wrapped function.
   * @example
   * ```ts
   * wrapTransaction({
   *  name: 'my-transaction',
   * statExtractor: (result,transaction) => {
   *   transaction.setMeasurement("memoryUsed", result.mem, "byte");
   *  },()=>{...})
   * ```
   */
  statExtractor?: (val: U, transaction: Transaction) => void;
}

interface BackendTransactionOptions {
  name: string;
  /**
   * String that will be used as transaction's unique id.
   */
  id: string;
  /**
   * Whether its the start or end of transaction.
   */
  type: 'start' | 'end';
}

export const startTransactionFromPlugin = async (opts: BackendTransactionOptions) => {
  console.log('Starting trans', opts);

  const transaction = startTransaction({ name: opts.name });

  getCurrentHub().configureScope((scope) => {
    scope.setTag('transaction_id', opts.id);
    scope.setSpan(transaction);
  });
  Promise.resolve();
};

export const endTransactionFromPlugin = async (opts: BackendTransactionOptions) => {
  console.log('Ending trans', opts);

  getCurrentHub().configureScope((scope) => {
    scope.setTag('transaction_id', opts.id);
  });

  // TODO: I dont know if this will properly add the transaction to the one from the unique transaction id.
  const transaction = startTransaction({ name: `${opts.name}-backend` });

  transaction.finish();
};

// eslint-disable-next-line @typescript-eslint/ban-types
export const wrapTransaction = async <U>(opts: TransactionOptions<U>, fn: () => U): Promise<U> => {
  // Do not run profiling if we are not in production
  if (!shouldProfile()) {
    return fn();
  }

  const transaction = startTransaction({ name: opts.name });

  getCurrentHub().configureScope((scope) => scope.setSpan(transaction));
  const span = transaction.startChild({ op: fn.name, description: opts.description }); // This function returns a Span

  let result: U;

  try {
    result = await fn();
    if (opts.statExtractor) {
      opts.statExtractor(result, transaction);
    }
    span.setStatus(OK);
  } catch (err) {
    span.setStatus(UNKNOWN_ERROR);
    throw err;
  } finally {
    span.finish(); // Remember that only finished spans will be sent with the
  }

  transaction.finish();
  return result;
};

export const spanTransaction = async <U>(opts: TransactionOptions<U>, fn: () => U): Promise<U> => {
  // Do not run profiling if we are not in production
  if (!shouldProfile()) {
    return fn();
  }

  const transaction = getCurrentHub().getScope().getTransaction();
  const existingSpan = getCurrentHub().getScope().getSpan();

  let result: U;
  if (transaction || existingSpan) {
    // We attempt to make a subspan before creating a span directly from the transaction
    const span = (existingSpan || transaction)!.startChild({
      op: opts.name,
      description: opts.description,
    });

    try {
      result = await fn();

      if (opts.statExtractor) {
        opts.statExtractor(result, transaction!);
      }
      // Do something
      span.setStatus(OK);
    } catch (err) {
      span.setStatus(UNKNOWN_ERROR);
      throw err;
    } finally {
      span.finish();
    }
  } else {
    result = fn();
  }

  return result;
};
