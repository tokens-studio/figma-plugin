import * as Sentry from '@sentry/react';
import { handleReactError } from './error/handleReactError';

type GetLicenseKeyResponse =
  { key: string; }
  | { error: string; };

export default async function getLicenseKey(userId: string | null): Promise<GetLicenseKeyResponse> {
  try {
    const res = await fetch(`${process.env.LICENSE_API_URL}/get-license?userId=${userId}`);
    if (res.status === 200) {
      return await res.json();
    }

    const { message } = await res.json();
    return {
      error: message,
    };
  } catch (e) {
    Sentry.captureException(e);
    handleReactError(e);
    return {
      error: 'Error fetching license',
    };
  }
}
