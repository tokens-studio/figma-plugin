export type RefreshErrorKind = 'fatal' | 'transient';

/**
 * Typed refresh error. Only "fatal" errors (invalid_grant, invalid_token,
 * invalid_client) should trigger a logout. Transient errors (network, 5xx)
 * should let the session survive so a subsequent attempt can succeed.
 */
export class RefreshError extends Error {
  kind: RefreshErrorKind;

  constructor(kind: RefreshErrorKind, message: string) {
    super(message);
    this.name = 'RefreshError';
    this.kind = kind;
  }
}

/** Error codes that indicate the refresh token itself is permanently invalid. */
const FATAL_ERROR_CODES = ['invalid_grant', 'invalid_token', 'invalid_client', 'unauthorized_client'];

export function classifyError(error: unknown): RefreshErrorKind {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (FATAL_ERROR_CODES.some((code) => msg.includes(code))) {
      return 'fatal';
    }
  }
  return 'transient';
}
