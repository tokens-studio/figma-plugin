/**
 * Utility functions for JWT/authentication error handling
 */
export function isJWTError(errorMessage: string): boolean {
  return errorMessage.includes('jwt')
    || errorMessage.includes('JWT')
    || errorMessage.includes('token')
    || errorMessage.includes('Unauthorized')
    || errorMessage.includes('401')
    || errorMessage.includes('invalid_token')
    || errorMessage.includes('token_expired');
}

export function getErrorMessage(error: any): string {
  return error?.message || error?.toString() || '';
}
