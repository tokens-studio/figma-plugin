import * as Sentry from '@sentry/react';

export function handleReactError(error: any) {
  console.error(error);
  Sentry.captureException(error);
}
