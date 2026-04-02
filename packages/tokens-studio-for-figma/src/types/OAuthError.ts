export enum OAuthErrorType {
  CONFIG_FETCH_FAILED = 'CONFIG_FETCH_FAILED',
  INVALID_CONFIG = 'INVALID_CONFIG',
  KEYPAIR_GENERATION_FAILED = 'KEYPAIR_GENERATION_FAILED', // Legacy, kept for backwards compatibility
  POPUP_BLOCKED = 'POPUP_BLOCKED', // Legacy, kept for backwards compatibility
  AUTH_TIMEOUT = 'AUTH_TIMEOUT',
  TOKEN_EXCHANGE_FAILED = 'TOKEN_EXCHANGE_FAILED',
  TOKEN_REFRESH_FAILED = 'TOKEN_REFRESH_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  // Device Code Flow errors
  DEVICE_CODE_REQUEST_FAILED = 'DEVICE_CODE_REQUEST_FAILED',
  DEVICE_CODE_EXPIRED = 'DEVICE_CODE_EXPIRED',
  AUTHORIZATION_PENDING = 'AUTHORIZATION_PENDING', // Not really an error, but used for polling state
  SLOW_DOWN = 'SLOW_DOWN',
  INVALID_DEVICE_CODE = 'INVALID_DEVICE_CODE',
}

export class OAuthError extends Error {
  constructor(
    public type: OAuthErrorType,
    message: string,
    public userMessage?: string,
  ) {
    super(message);
    this.name = 'OAuthError';
  }

  getUserMessage(): string {
    return this.userMessage || this.getDefaultUserMessage();
  }

  private getDefaultUserMessage(): string {
    switch (this.type) {
      case OAuthErrorType.CONFIG_FETCH_FAILED:
        return 'Unable to connect to the studio. Please check the studio URL and try again.';
      case OAuthErrorType.INVALID_CONFIG:
        return 'The studio configuration is invalid. Please contact support.';
      case OAuthErrorType.KEYPAIR_GENERATION_FAILED:
        return 'Failed to generate authentication keys. Please try again.';
      case OAuthErrorType.POPUP_BLOCKED:
        return "Please allow popups for this page and try again. Check your browser's popup blocker settings.";
      case OAuthErrorType.AUTH_TIMEOUT:
        return 'Authentication timed out. Please try again and complete the login process more quickly.';
      case OAuthErrorType.TOKEN_EXCHANGE_FAILED:
        return 'Failed to complete authentication. Please try again.';
      case OAuthErrorType.TOKEN_REFRESH_FAILED:
        return 'Your session has expired. Please log in again.';
      case OAuthErrorType.NETWORK_ERROR:
        return 'Network error occurred. Please check your connection and try again.';
      // Device Code Flow errors
      case OAuthErrorType.DEVICE_CODE_REQUEST_FAILED:
        return 'Failed to request authorization code. Please try again.';
      case OAuthErrorType.DEVICE_CODE_EXPIRED:
        return 'The authorization code has expired. Please try again.';
      case OAuthErrorType.AUTHORIZATION_PENDING:
        return 'Waiting for authorization...';
      case OAuthErrorType.SLOW_DOWN:
        return 'Please wait a moment before checking again.';
      case OAuthErrorType.INVALID_DEVICE_CODE:
        return 'Invalid authorization code. Please try again.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
}
