export function normalizeLicenseApiUrl(url: string) {
  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    throw new Error('License API URL cannot be empty');
  }

  let withProtocol: string;
  if (/^[a-z][a-z\d+\-.]*:\/\//i.test(trimmedUrl)) {
    withProtocol = trimmedUrl;
  } else if (/^(localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/i.test(trimmedUrl)) {
    withProtocol = `http://${trimmedUrl}`;
  } else {
    withProtocol = `https://${trimmedUrl}`;
  }

  if (!/^https?:\/\//i.test(withProtocol)) {
    throw new Error('License API URL must use http or https');
  }

  // Strip trailing slashes without relying on the URL constructor (unavailable in Figma sandbox)
  return withProtocol.replace(/\/+$/, '');
}

// Every license request is tried here first.
export const PRIMARY_LICENSE_API_URL = normalizeLicenseApiUrl('https://api-production.tokens.studio');

// Kept only for the duration of the license data migration. Requests fall back
// here when the primary cannot answer them.
export const LEGACY_LICENSE_API_URL = normalizeLicenseApiUrl(
  process.env.LICENSE_API_URL || 'https://licence.tokens.studio',
);

/**
 * Hosts in the order they are tried.
 *
 * MIGRATION: once the `License API fallback` telemetry reports no more
 * `migrationGap: true` events, drop LEGACY_LICENSE_API_URL from this list and
 * delete the `isComplete` guard in licenseApi.ts along with it — with a single
 * host there is nowhere to fall back to, and the guard would start turning
 * entitlement-less responses into hard errors.
 */
export const LICENSE_API_HOSTS: string[] = PRIMARY_LICENSE_API_URL === LEGACY_LICENSE_API_URL
  ? [PRIMARY_LICENSE_API_URL]
  : [PRIMARY_LICENSE_API_URL, LEGACY_LICENSE_API_URL];
