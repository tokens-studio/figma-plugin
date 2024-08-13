import * as Sentry from '@sentry/react';
import { Entitlements } from '@/app/store/models/userState';

export default async function validateLicense(
  licenseKey: string,
  userId: string | null,
  userName?: string | null,
): Promise<{ plan?: string; entitlements?: Entitlements[]; email?: string; error?: string }> {
  try {
    const res = await fetch(
      `${process.env.LICENSE_API_URL}/validate-license?licenseKey=${licenseKey}&userId=${userId}${
        userName ? `&userName=${userName}` : ''
      }`,
    );

    if (res.status === 200) {
      return await res.json();
    }

    const { message } = await res.json();
    return {
      error: message,
    };
  } catch (e) {
    console.log(e);
    Sentry.captureException(e);
    return {
      error: 'Error validating license',
    };
  }
}
