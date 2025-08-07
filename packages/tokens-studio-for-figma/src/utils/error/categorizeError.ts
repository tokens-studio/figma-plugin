import { ErrorMessages } from '@/constants/ErrorMessages';
import { transformProviderName } from '@/utils/transformProviderName';
import { StorageProviderType } from '@/constants/StorageProviderType';

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
    type: 'credential' | 'parsing' | 'connectivity' | 'other';
    message: string;
    header?: string;
  } {
  const errorString = String(error);
  const errorMessage = error?.message || errorString;

  // Helper function to get provider-specific messages
  const getProviderSpecificMessage = (baseMessage: string, type: 'credential' | 'connectivity') => {
    if (!context?.provider) return baseMessage;

    const providerName = transformProviderName(context.provider);

    if (type === 'credential') {
      if (context.hasCredentials === false) {
        return `Could not load tokens from ${providerName}. No credentials configured.`;
      }
      return `Could not load tokens from ${providerName}. Please check your credentials.`;
    }

    if (type === 'connectivity') {
      return `Unable to connect to ${providerName}. Please check your internet connection or try again later.`;
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

  if (
    errorMessage.includes('Network')
    || errorMessage.includes('network')
    || errorMessage.includes('ENOTFOUND')
    || errorMessage.includes('ECONNREFUSED')
    || errorMessage.includes('ETIMEDOUT')
    || errorMessage.includes('timeout')
    || errorMessage.includes('Connection')
    || errorMessage.includes('connection')
    || errorMessage.includes('unreachable')
    || errorMessage.includes('offline')
    || errorMessage.includes('Failed to fetch')
    || errorMessage.includes('fetch failed')
    || errorMessage.includes('ERR_NETWORK')
    || errorMessage.includes('ERR_INTERNET_DISCONNECTED')
    || errorMessage.includes('500')
    || errorMessage.includes('502')
    || errorMessage.includes('503')
    || errorMessage.includes('504')
    || errorMessage.includes('Internal Server Error')
    || errorMessage.includes('Bad Gateway')
    || errorMessage.includes('Service Unavailable')
    || errorMessage.includes('Gateway Timeout')
  ) {
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
  if (
    errorMessage.includes('401')
    || errorMessage.includes('403')
    || errorMessage.includes('Unauthorized')
    || errorMessage.includes('Forbidden')
    || errorMessage.includes('credential')
    || errorMessage.includes('authentication')
    || errorMessage.includes('Authentication')
    || errorMessage.includes('permission')
  ) {
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
