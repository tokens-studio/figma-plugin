import * as Sentry from '@sentry/react';
import { Entitlements } from '@/app/store/models/userState';

// Validates a license key against the new studio-on-rails backend, which
// mirrors the legacy /validate-license contract. Used only when the user
// opts in via the "Validate license against the new Tokens Studio platform"
// setting; the legacy backend stays the source of truth during migration.
export default async function validateLicenseStudio(
  licenseKey: string,
  userId: string | null,
  userName?: string | null,
): Promise<{ plan?: string; entitlements?: Entitlements[]; email?: string; error?: string }> {
  if (!process.env.STUDIO_LICENSE_API_URL) {
    return {
      error: 'Studio license API not configured',
    };
  }

  try {
    const res = await fetch(
      `${process.env.STUDIO_LICENSE_API_URL}/validate-license?licenseKey=${licenseKey}&userId=${userId}${
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
