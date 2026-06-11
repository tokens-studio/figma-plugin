import * as Sentry from '@sentry/react';
import validateLicense from './validateLicense';
import validateLicenseStudio from './validateLicenseStudio';

// Opt-in parallel validation against the new studio-on-rails backend
// (Phase 1 of the legacy → studio license migration).
//
// Both backends are called side by side. The studio result is used when it
// succeeds (so migrated volunteers exercise the new backend for real); any
// studio failure falls back to the legacy result, so an un-migrated key —
// or a studio outage — never costs the user their Pro unlock. Mismatches
// are reported for the Phase 1 "matches legacy 1:1" exit criteria.
export default async function validateLicenseWithStudio(
  licenseKey: string,
  userId: string | null,
  userName?: string | null,
): ReturnType<typeof validateLicense> {
  const [legacyResult, studioResult] = await Promise.all([
    validateLicense(licenseKey, userId, userName),
    validateLicenseStudio(licenseKey, userId, userName),
  ]);

  const mismatch = Boolean(legacyResult.error) !== Boolean(studioResult.error);
  if (mismatch) {
    console.warn('License validation mismatch between legacy and studio backends', {
      legacyError: legacyResult.error,
      studioError: studioResult.error,
    });
    Sentry.captureMessage('License validation mismatch between legacy and studio backends', {
      level: 'warning',
      extra: {
        legacyError: legacyResult.error ?? null,
        studioError: studioResult.error ?? null,
      },
    });
  }

  return studioResult.error ? legacyResult : studioResult;
}
