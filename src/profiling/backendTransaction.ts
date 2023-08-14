import { reportFromPlugin } from '@/plugin/notifiers';

const shouldProfile = () => {
  switch (process.env.ENVIRONMENT) {
    case 'production':
    case 'beta':
      return !!process.env.SENTRY_DSN;
    default:
      return false;
  }
};

export const wrapBackendTransaction = async <U>(name: string, fn: () => U) => {
  // Do not run profiling if we are not in production
  if (!shouldProfile()) {
    return;
  }

  // This all runs in the backend so we dont have fetch available, we need to use the bridge and then associate the transaction id
  const uniqueTransactionId = Math.random().toString(36).substring(7);
  reportFromPlugin({ name, id: uniqueTransactionId, type: 'start' });
  await fn();
  reportFromPlugin({ name, id: uniqueTransactionId, type: 'end' });
};
