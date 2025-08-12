import { ErrorMessages } from '@/constants/ErrorMessages';
import { transformProviderName } from '@/utils/transformProviderName';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { ErrorCategory } from '@/types/ErrorCategory';

/**
 * Categorizes an error to determine if it's a JSON parsing error, credential error, connectivity error, or other
 * @param error - The error object or string
 * @param context - Optional context about the provider or operation for more specific error messages
 * @returns Object with error type, message, and optional header for display
 */
export function categorizeError(error: any, context?: {
  provider?: StorageProviderType;
  operation?: string;
  hasCredentials?: boolean;
}): {
    type: ErrorCategory;
    message: string;
    header?: string;
  } {
  const errorString = String(error);
  const errorMessage = error?.message || errorString;

  // Helper function to get provider-specific messages using ErrorMessages constants
  const getProviderSpecificMessage = (baseMessage: string, type: 'credential' | 'connectivity') => {
    if (!context?.provider) return baseMessage;

    if (type === 'credential') {
      switch (context.provider) {
        case StorageProviderType.GITHUB:
          return ErrorMessages.GITHUB_CREDENTIAL_ERROR;
        case StorageProviderType.GITLAB:
          return ErrorMessages.GITLAB_CREDENTIAL_ERROR;
        case StorageProviderType.BITBUCKET:
          return ErrorMessages.BITBUCKET_CREDENTIAL_ERROR;
        case StorageProviderType.ADO:
          return ErrorMessages.ADO_CREDENTIAL_ERROR;
        case StorageProviderType.URL:
          return ErrorMessages.URL_CREDENTIAL_ERROR;
        case StorageProviderType.JSONBIN:
          return ErrorMessages.JSONBIN_CREDENTIAL_ERROR;
        case StorageProviderType.SUPERNOVA:
          return ErrorMessages.SUPERNOVA_CREDENTIAL_ERROR;
        case StorageProviderType.TOKENS_STUDIO:
          return ErrorMessages.TOKENSSTUDIO_CREDENTIAL_ERROR;
        default:
          return ErrorMessages.REMOTE_CREDENTIAL_ERROR;
      }
    }

    if (type === 'connectivity') {
      switch (context.provider) {
        case StorageProviderType.GITHUB:
          return ErrorMessages.GITHUB_CONNECTIVITY_ERROR;
        case StorageProviderType.GITLAB:
          return ErrorMessages.GITLAB_CONNECTIVITY_ERROR;
        case StorageProviderType.BITBUCKET:
          return ErrorMessages.BITBUCKET_CONNECTIVITY_ERROR;
        case StorageProviderType.ADO:
          return ErrorMessages.ADO_CONNECTIVITY_ERROR;
        case StorageProviderType.TOKENS_STUDIO:
          return ErrorMessages.TOKENSSTUDIO_CONNECTIVITY_ERROR;
        case StorageProviderType.JSONBIN:
          return ErrorMessages.JSONBIN_CONNECTIVITY_ERROR;
        default:
          return ErrorMessages.CONNECTIVITY_ERROR;
      }
    }

    return baseMessage;
  };

  // Check if it's a JSON parsing error
  if (
    errorMessage.includes('JSON')
    || errorMessage.includes('parse')
    || errorMessage.includes('Unexpected token')
    || errorMessage.includes('Unexpected end of JSON input')
    || errorMessage.includes('Invalid JSON')
    || errorString.includes('SyntaxError')
  ) {
    const baseMessage = `${ErrorMessages.JSON_PARSE_ERROR}: ${errorMessage}`;
    const header = context?.provider
      ? `Could not load tokens from ${transformProviderName(context.provider)}`
      : 'JSON Parsing Error';

    return {
      type: 'parsing',
      message: baseMessage,
      header,
    };
  }

  // Check for connectivity/network errors
  const connectivityKeywords = [
    'Network',
    'network',
    'ENOTFOUND',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'timeout',
    'Connection',
    'connection',
    'unreachable',
    'offline',
    'Failed to fetch',
    'fetch failed',
    'ERR_NETWORK',
    'ERR_INTERNET_DISCONNECTED',
    '500',
    '502',
    '503',
    '504',
    'Internal Server Error',
    'Bad Gateway',
    'Service Unavailable',
    'Gateway Timeout',
  ];

  const hasConnectivityError = connectivityKeywords.some((keyword) => errorMessage.includes(keyword));

  if (hasConnectivityError) {
    const message = getProviderSpecificMessage(errorMessage, 'connectivity');
    const header = context?.provider
      ? `Could not load tokens from ${transformProviderName(context.provider)}`
      : 'Connection Error';

    return {
      type: 'connectivity',
      message,
      header,
    };
  }

  // Check if it's a credential-related error
  const credentialKeywords = [
    '401',
    '403',
    'Unauthorized',
    'Forbidden',
    'credential',
    'authentication',
    'Authentication',
    'permission',
  ];

  const hasCredentialError = credentialKeywords.some((keyword) => errorMessage.includes(keyword));

  if (hasCredentialError) {
    const message = getProviderSpecificMessage(errorMessage, 'credential');
    const header = context?.provider
      ? `Could not load tokens from ${transformProviderName(context.provider)}`
      : 'Authentication Error';

    return {
      type: 'credential',
      message,
      header,
    };
  }

  // For other errors, return the original message
  const header = context?.provider
    ? `Could not load tokens from ${transformProviderName(context.provider)}`
    : 'Error';

  return {
    type: 'other',
    message: errorMessage,
    header,
  };
}
