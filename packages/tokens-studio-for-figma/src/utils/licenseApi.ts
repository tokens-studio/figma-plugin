import * as Sentry from '@sentry/react';
import { track } from './analytics';
import { LICENSE_API_HOSTS } from './licenseApiUrl';

// There is no timeout on fetch by default. Without one an unreachable host
// hangs the startup process forever instead of falling back.
export const LICENSE_API_TIMEOUT_MS = 8000;

type FailureReason =
  | 'transport' // network error, DNS, CORS
  | 'timeout' // exceeded LICENSE_API_TIMEOUT_MS
  | 'status' // responded, but not with a 200
  | 'parse' // 200 with a body we could not read as JSON
  | 'incomplete'; // 200, valid JSON, but the payload failed the caller's check

export type LicenseApiAttempt = {
  host: string;
  status: number | null;
  reason: FailureReason | null;
  message?: string;
};

export type LicenseApiResult<T> =
  | { ok: true; data: T; attempts: LicenseApiAttempt[] }
  | { ok: false; message: string | null; attempts: LicenseApiAttempt[] };

type LicenseApiOptions<T> = {
  /**
   * Marks the endpoint in telemetry. Not the raw path — that carries the
   * license key and user id.
   */
  endpoint: string;
  init?: RequestInit;
  /**
   * Hashed before it is sent. Lets a migration gap be traced back to the
   * account whose record did not make it across.
   */
  figmaId?: string | null;
  /**
   * Guard against a half-migrated record answering 200 with a valid-looking
   * but empty payload, which would otherwise silently downgrade the user.
   * Returning false falls through to the next host.
   */
  isComplete?: (data: T) => boolean;
};

async function attemptHost<T>(
  host: string,
  path: string,
  { init, isComplete }: Pick<LicenseApiOptions<T>, 'init' | 'isComplete'>,
): Promise<LicenseApiAttempt & { data?: T }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LICENSE_API_TIMEOUT_MS);

  try {
    const res = await fetch(`${host}${path}`, { ...init, signal: controller.signal });
    // Read the body once — res.json() cannot be called twice, and both the
    // success and the error path need it.
    const text = await res.text();

    let body: any;
    try {
      if (!text) throw new Error('Empty response body');
      body = JSON.parse(text);
    } catch {
      return { host, status: res.status, reason: 'parse' };
    }

    const message = typeof body?.message === 'string' ? body.message : undefined;

    if (res.status !== 200) {
      return {
        host, status: res.status, reason: 'status', message,
      };
    }

    if (isComplete && !isComplete(body as T)) {
      return {
        host, status: res.status, reason: 'incomplete', message,
      };
    }

    return {
      host, status: res.status, reason: null, data: body as T,
    };
  } catch (e: any) {
    return {
      host,
      status: null,
      reason: e?.name === 'AbortError' ? 'timeout' : 'transport',
    };
  } finally {
    clearTimeout(timer);
  }
}

function reportFallback(endpoint: string, attempts: LicenseApiAttempt[], figmaId?: string | null) {
  const [primary, fallback] = attempts;
  // The cutover signal: the primary could not answer and the legacy host
  // could. Free users fail on both hosts and are deliberately excluded —
  // otherwise this number has a permanent floor and never reaches zero.
  const migrationGap = !!primary && primary.reason !== null && !!fallback && fallback.reason === null;

  track('License API fallback', {
    endpoint,
    primaryStatus: primary?.status ?? null,
    primaryReason: primary?.reason ?? null,
    fallbackStatus: fallback?.status ?? null,
    resolvedBy: attempts.find((a) => a.reason === null)?.host ?? null,
    migrationGap,
    ...(figmaId ? { figmaId } : {}),
  });

  Sentry.addBreadcrumb({
    category: 'license-api',
    level: 'info',
    message: `${endpoint} fell back from ${primary?.host}`,
    data: { primaryStatus: primary?.status, primaryReason: primary?.reason, migrationGap },
  });
}

/**
 * Tries each host in LICENSE_API_HOSTS in order, returning the first clean
 * answer. Anything short of one — transport error, timeout, non-200,
 * unreadable body, or a payload the caller rejects — moves on to the next
 * host. The last host's error is what the caller surfaces.
 */
export async function fetchLicenseApi<T>(
  path: string,
  options: LicenseApiOptions<T>,
): Promise<LicenseApiResult<T>> {
  const { endpoint, figmaId, ...rest } = options;
  const attempts: LicenseApiAttempt[] = [];

  for (let i = 0; i < LICENSE_API_HOSTS.length; i += 1) {
    // Sequential on purpose — the fallback only runs when the primary failed.
    // eslint-disable-next-line no-await-in-loop
    const { data, ...attempt } = await attemptHost<T>(LICENSE_API_HOSTS[i], path, rest);
    attempts.push(attempt);

    if (attempt.reason === null && data !== undefined) {
      if (attempts.length > 1) reportFallback(endpoint, attempts, figmaId);
      return { ok: true, data, attempts };
    }
  }

  if (attempts.length > 1) reportFallback(endpoint, attempts, figmaId);

  // A 404 from every host is an ordinary "no license" answer. Every host
  // failing to respond at all is not, and is what the previous per-helper
  // Sentry.captureException reported.
  if (attempts.every((a) => a.reason === 'transport' || a.reason === 'timeout')) {
    Sentry.captureMessage(`License API unreachable: ${endpoint}`, {
      level: 'error',
      extra: { attempts },
    });
  }

  return {
    ok: false,
    message: attempts[attempts.length - 1]?.message ?? null,
    attempts,
  };
}
